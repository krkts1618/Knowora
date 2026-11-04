import { headers } from "next/headers";
import { auth } from "./auth";
import { UnauthorizedError } from "@/lib/errors/app-error";

export async function getServerSession() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });
  return session;
}

export async function requireAuth() {
  const session = await getServerSession();
  if (!session || !session.user) {
    throw new UnauthorizedError("Authentication is required to access this resource");
  }
  return session;
}
