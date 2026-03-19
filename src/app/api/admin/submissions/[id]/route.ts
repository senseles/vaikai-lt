import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';
import { slugify } from '@/lib/lithuanian';
import { VALID_CITY_SLUGS } from '@/lib/cities';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const submission = await prisma.submission.findUnique({
      where: { id: params.id },
    });
    if (!submission) {
      return NextResponse.json({ success: false, error: 'Pasiūlymas nerastas.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: submission });
  } catch (err) {
    console.error('Admin submission GET error:', err);
    return NextResponse.json({ success: false, error: 'Serverio klaida.' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Netinkamas formatas.' }, { status: 400 });
  }

  const { action, adminNotes, rejectionReason, editedData } = body as {
    action?: string;
    adminNotes?: string;
    rejectionReason?: string;
    editedData?: Record<string, unknown>;
  };

  if (!action || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Netinkamas veiksmas.' }, { status: 400 });
  }

  try {
    const submission = await prisma.submission.findUnique({
      where: { id: params.id },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Pasiūlymas nerastas.' }, { status: 404 });
    }

    if (submission.status !== 'PENDING') {
      return NextResponse.json({ error: 'Šis pasiūlymas jau peržiūrėtas.' }, { status: 400 });
    }

    if (action === 'reject') {
      const updated = await prisma.submission.update({
        where: { id: params.id },
        data: {
          status: 'REJECTED',
          rejectionReason: typeof rejectionReason === 'string' ? rejectionReason : null,
          adminNotes: typeof adminNotes === 'string' ? adminNotes : null,
          reviewedBy: 'admin',
          reviewedAt: new Date(),
        },
      });

      await logAuditEvent({
        action: 'SUBMISSION_REJECT',
        targetType: 'submission',
        targetId: params.id,
        details: rejectionReason || null,
      });

      return NextResponse.json({ success: true, data: updated });
    }

    // Approve: create entity in a transaction
    const data = (editedData || submission.data) as Record<string, string>;
    const entityName = data.name || 'Unnamed';
    const entityCity = data.city || '';

    // Validate city exists in our system
    const citySlug = slugify(entityCity);
    if (!citySlug || !VALID_CITY_SLUGS.has(citySlug)) {
      // Check if any existing city matches case-insensitively
      const existingCity = Array.from(VALID_CITY_SLUGS).find(
        (s) => s === citySlug || s === entityCity.toLowerCase()
      );
      if (!existingCity) {
        return NextResponse.json({
          error: `Miestas „${entityCity}" nerastas sistemoje. Pataisykite miesto pavadinimą prieš tvirtinant. Galimi miestai: ${Array.from(VALID_CITY_SLUGS).slice(0, 10).join(', ')}...`,
        }, { status: 400 });
      }
    }

    const baseSlug = slugify(entityName);

    // Ensure unique slug
    let slug = baseSlug;
    let counter = 0;
    let slugExists = true;

    while (slugExists) {
      const testSlug = counter === 0 ? slug : `${slug}-${counter}`;
      const existing = await checkSlugExists(submission.entityType, testSlug);
      if (!existing) {
        slug = testSlug;
        slugExists = false;
      } else {
        counter++;
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      let createdEntityId: string;

      const commonFields = {
        slug,
        name: entityName,
        city: data.city || '',
        address: data.address || null,
        phone: data.phone || null,
        website: data.website || null,
        description: data.description || null,
        isUserAdded: true,
        verificationStatus: 'UNVERIFIED' as const,
      };

      switch (submission.entityType) {
        case 'KINDERGARTEN': {
          const entity = await tx.kindergarten.create({
            data: {
              ...commonFields,
              hours: data.hours || null,
            },
          });
          createdEntityId = entity.id;
          break;
        }
        case 'AUKLE': {
          const entity = await tx.aukle.create({
            data: {
              ...commonFields,
              email: data.email || null,
              experience: data.experience || null,
              ageRange: data.ageRange || null,
            },
          });
          createdEntityId = entity.id;
          break;
        }
        case 'BURELIS': {
          const entity = await tx.burelis.create({
            data: {
              ...commonFields,
              category: data.category || null,
              ageRange: data.ageRange || null,
              price: data.price || null,
            },
          });
          createdEntityId = entity.id;
          break;
        }
        case 'SPECIALIST': {
          const entity = await tx.specialist.create({
            data: {
              ...commonFields,
              specialty: data.specialty || null,
              clinic: data.clinic || null,
              price: data.price || null,
            },
          });
          createdEntityId = entity.id;
          break;
        }
        default:
          throw new Error(`Unknown entity type: ${submission.entityType}`);
      }

      const updated = await tx.submission.update({
        where: { id: params.id },
        data: {
          status: 'APPROVED',
          adminNotes: typeof adminNotes === 'string' ? adminNotes : null,
          reviewedBy: 'admin',
          reviewedAt: new Date(),
          createdEntityId,
        },
      });

      return updated;
    });

    await logAuditEvent({
      action: 'SUBMISSION_APPROVE',
      targetType: 'submission',
      targetId: params.id,
      newValue: JSON.stringify({ entityType: submission.entityType, entityName, slug }),
      details: adminNotes || null,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error('Admin submission PATCH error:', err);
    return NextResponse.json({ success: false, error: 'Nepavyko apdoroti pasiūlymo.' }, { status: 500 });
  }
}

async function checkSlugExists(entityType: string, slug: string): Promise<boolean> {
  switch (entityType) {
    case 'KINDERGARTEN':
      return !!(await prisma.kindergarten.findUnique({ where: { slug } }));
    case 'AUKLE':
      return !!(await prisma.aukle.findUnique({ where: { slug } }));
    case 'BURELIS':
      return !!(await prisma.burelis.findUnique({ where: { slug } }));
    case 'SPECIALIST':
      return !!(await prisma.specialist.findUnique({ where: { slug } }));
    default:
      return false;
  }
}
