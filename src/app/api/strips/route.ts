import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 💡 SUNTIKAN SAKTI: Memaksa Next.js & Vercel untuk selalu mengambil data segar langsung dari TiDB Cloud (Anti-Cache!)
export const dynamic = "force-dynamic";

interface InputElement {
  id: string;
  type: "photo" | "sticker";
  src?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotate?: number;
  radius?: string;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const cleanWidth = parseInt(String(body.canvasWidth)) || 300;
    const cleanHeight = parseInt(String(body.canvasHeight)) || 900;
    const cleanShots = parseInt(String(body.totalShots)) || 4;
    const rawElements: InputElement[] = body.elements || [];

    const newStrip = await prisma.stripTemplate.create({
      data: {
        name: body.name || "Untitled Template",
        thumbnailUrl: body.thumbnailUrl || "",
        backgroundMode: body.backgroundMode,
        backgroundValue: body.backgroundValue,
        totalShots: cleanShots,
        canvasWidth: cleanWidth,
        canvasHeight: cleanHeight,
        elements: body.elements || [],
        photoPositions: rawElements
          .filter((el) => el.type === "photo")
          .map((el, index: number) => ({
            id: el.id,
            index,
            x: Number(el.x),
            y: Number(el.y),
            w: Number(el.w),
            h: Number(el.h),
            rotate: Number(el.rotate || 0),
            radius: el.radius || "0px",
          })),
        overlays: rawElements
          .filter((el) => el.type === "sticker")
          .map((el) => ({
            src: el.src || "",
            x: Number(el.x),
            y: Number(el.y),
            w: Number(el.w),
            h: Number(el.h),
            rotate: Number(el.rotate || 0),
          })),
      },
    });

    return NextResponse.json(newStrip, { status: 201 });
  } catch (error) {
    console.error("DATABASE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to save template" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // 💡 SOLUSI DUNIA AKHIRAT REZ: Pake $transaction biar sekali angkut 20 data gak bakal crash/deadlock!
    if (body.reorder && Array.isArray(body.ids)) {
      const idArray: string[] = body.ids;

      // 1. Kita kumpulin dulu semua list antrean update ke dalam array teks query
      const updates = idArray.map((targetId, index) => {
        return prisma.stripTemplate.update({
          where: { id: targetId },
          data: {
            thumbnailUrl: "", // Bersihkan sisa string index lama
            // Set jarak tanggal linear statis yang rapi (berjarak 1 hari per item)
            createdAt: new Date(1700000000000 + index * 86400000),
          },
        });
      });

      // 2. Tembak sekaligus dalam SATU gerbong kereta transaksi sejati ke TiDB Cloud!
      await prisma.$transaction(updates);

      return NextResponse.json({
        message: "All reorders locked perfectly and permanently in TiDB Cloud!",
      });
    }

    // --- SISA LOGIC UPDATE EDIT TEMPLATE BIASA ---
    const { id, ...updateData } = body;
    const rawElements: InputElement[] = updateData.elements || [];

    const updatedStrip = await prisma.stripTemplate.update({
      where: { id },
      data: {
        name: updateData.name,
        backgroundMode: updateData.backgroundMode,
        backgroundValue: updateData.backgroundValue,
        totalShots: parseInt(String(updateData.totalShots)),
        canvasWidth: parseInt(String(updateData.canvasWidth)),
        canvasHeight: parseInt(String(updateData.canvasHeight)),
        elements: updateData.elements,
        photoPositions: rawElements
          .filter((el) => el.type === "photo")
          .map((el, idx: number) => ({
            id: el.id,
            index: idx,
            x: Number(el.x),
            y: Number(el.y),
            w: Number(el.w),
            h: Number(el.h),
            rotate: Number(el.rotate || 0),
            radius: el.radius || "0px",
          })),
        overlays: rawElements
          .filter((el) => el.type === "sticker")
          .map((el) => ({
            src: el.src || "",
            x: Number(el.x),
            y: Number(el.y),
            w: Number(el.w),
            h: Number(el.h),
            rotate: Number(el.rotate || 0),
          })),
      },
    });

    return NextResponse.json(updatedStrip);
  } catch (error) {
    console.error("TRANSACTION PUT ERROR:", error);
    return NextResponse.json(
      { error: "Failed to lock database transaction" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const dbData = await prisma.stripTemplate.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "asc", // 💡 FIX: Diurutkan secara linear dari tanggal terlama ke terbaru. Pasti kokoh!
      },
    });
    return NextResponse.json(dbData);
  } catch (error) {
    console.error("GET ERROR:", error);
    return NextResponse.json(
      { error: "Failed to load template" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "ID needed" }, { status: 400 });

    await prisma.stripTemplate.delete({ where: { id } });

    return NextResponse.json({ message: "Template successfully deleted!" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 },
    );
  }
}
