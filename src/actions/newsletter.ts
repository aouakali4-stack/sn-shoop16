"use server";

import { prisma } from "@/lib/prisma";

export async function subscribeToNewsletter(
  prevState: { success: boolean; message: string } | null,
  formData: FormData
) {
  const email = formData.get("email") as string;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: "Veuillez entrer une adresse e-mail valide." };
  }

  try {
    await prisma.newsletterSubscriber.create({
      data: { email },
    });
    return { success: true, message: "Merci pour votre inscription !" };
  } catch (error: any) {
    if (error?.code === "P2002") {
      return { success: false, message: "Cet e-mail est déjà inscrit à notre newsletter." };
    }
    return { success: false, message: "Une erreur est survenue. Veuillez réessayer." };
  }
}
