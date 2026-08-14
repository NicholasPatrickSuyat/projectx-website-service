"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createClient,
  setClientStatus,
  updateClient,
} from "@/lib/clients/repository";
import {
  validateClientInput,
  type FieldErrors,
} from "@/lib/clients/validation";

export type ClientActionState = {
  error?: string;
  fieldErrors?: FieldErrors;
} | null;

export async function createClientAction(
  _prevState: ClientActionState,
  formData: FormData,
): Promise<ClientActionState> {
  const parsed = validateClientInput(formData);

  if (!parsed.ok) {
    return { error: parsed.error, fieldErrors: parsed.fieldErrors };
  }

  const client = await createClient(parsed.data);
  revalidatePath("/clients");
  revalidatePath("/");
  redirect(`/clients/${client.id}`);
}

export async function updateClientAction(
  id: string,
  _prevState: ClientActionState,
  formData: FormData,
): Promise<ClientActionState> {
  if (!id) {
    return { error: "Client ID is missing." };
  }

  const parsed = validateClientInput(formData);

  if (!parsed.ok) {
    return { error: parsed.error, fieldErrors: parsed.fieldErrors };
  }

  const updated = await updateClient(id, parsed.data);

  if (!updated) {
    return { error: "That client could not be found." };
  }

  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  revalidatePath("/");
  redirect(`/clients/${id}`);
}

export async function markClientInactiveAction(id: string): Promise<void> {
  if (!id) {
    throw new Error("Client ID is missing.");
  }

  const updated = await setClientStatus(id, "INACTIVE");

  if (!updated) {
    throw new Error("That client could not be found.");
  }

  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  revalidatePath("/");
  redirect(`/clients/${id}`);
}

export async function reactivateClientAction(id: string): Promise<void> {
  if (!id) {
    throw new Error("Client ID is missing.");
  }

  const updated = await setClientStatus(id, "ACTIVE");

  if (!updated) {
    throw new Error("That client could not be found.");
  }

  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  revalidatePath("/");
  redirect(`/clients/${id}`);
}
