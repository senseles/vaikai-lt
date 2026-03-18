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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, entityType, status, rejectionReason } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Trūksta ids masyvo' }, { status: 400 });
    }

    if (!entityType || !status) {
      return NextResponse.json({ error: 'Trūksta entityType arba status' }, { status: 400 });
    }

    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Netinkamas statusas' }, { status: 400 });
    }

    if (status === 'REJECTED' && !rejectionReason?.trim()) {
      return NextResponse.json({ error: 'Atmetimui reikalinga priežastis' }, { status: 400 });
    }

    const model = getModel(entityType);
    if (!model) {
      return NextResponse.json({ error: 'Netinkamas entityType' }, { status: 400 });
    }

    let successCount = 0;
    let failCount = 0;

    for (const id of ids) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (model as any).update({
          where: { id },
          data: {
            verificationStatus: status,
            verifiedAt: new Date(),
            verifiedBy: 'admin',
            rejectionReason: status === 'REJECTED' ? rejectionReason.trim() : null,
          },
        });
        successCount++;
      } catch {
        failCount++;
      }
    }

    await logAuditEvent({
      action: status === 'VERIFIED' ? 'ENTITY_BULK_VERIFY' : 'ENTITY_BULK_REJECT',
      targetType: entityType,
      targetId: ids.join(','),
      newValue: status,
      details: `Masinis veiksmas: ${successCount} sėkmingai, ${failCount} nepavyko. ${rejectionReason || ''}`.trim(),
    });

    return NextResponse.json({
      success: true,
      successCount,
      failCount,
      total: ids.length,
    });
  } catch (err) {
    console.error('Verification bulk error:', err);
    return NextResponse.json({ error: 'Vidinė klaida' }, { status: 500 });
  }
}
