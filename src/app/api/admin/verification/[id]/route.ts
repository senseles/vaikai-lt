import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';

function getModel(type: string) {
  switch (type) {
    case 'kindergarten': return prisma.kindergarten;
    case 'aukle': return prisma.aukle;
    case 'burelis': return prisma.burelis;
    case 'specialist': return prisma.specialist;
    default: return null;
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { entityType, status, rejectionReason } = body;

    if (!entityType || !status) {
      return NextResponse.json({ error: 'Trūksta entityType arba status' }, { status: 400 });
    }

    if (!['VERIFIED', 'REJECTED', 'UNVERIFIED'].includes(status)) {
      return NextResponse.json({ error: 'Netinkamas statusas' }, { status: 400 });
    }

    if (status === 'REJECTED' && !rejectionReason?.trim()) {
      return NextResponse.json({ error: 'Atmetimui reikalinga priežastis' }, { status: 400 });
    }

    const model = getModel(entityType);
    if (!model) {
      return NextResponse.json({ error: 'Netinkamas entityType' }, { status: 400 });
    }

    // Get current status for audit log
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const current = await (model as any).findUnique({
      where: { id },
      select: { verificationStatus: true, name: true },
    });

    if (!current) {
      return NextResponse.json({ error: 'Įrašas nerastas' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {
      verificationStatus: status,
      verifiedAt: status === 'UNVERIFIED' ? null : new Date(),
      verifiedBy: status === 'UNVERIFIED' ? null : 'admin',
      rejectionReason: status === 'REJECTED' ? rejectionReason.trim() : null,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = await (model as any).update({
      where: { id },
      data: updateData,
    });

    await logAuditEvent({
      action: status === 'VERIFIED' ? 'ENTITY_VERIFY' : 'ENTITY_REJECT',
      targetType: entityType,
      targetId: id,
      oldValue: current.verificationStatus,
      newValue: status,
      details: rejectionReason || `${current.name} — statusas pakeistas į ${status}`,
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (err) {
    console.error('Verification PATCH error:', err);
    return NextResponse.json({ error: 'Vidinė klaida' }, { status: 500 });
  }
}
