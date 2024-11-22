import * as bcrypt from "bcrypt-edge";

import { database } from "./context";
import * as schema from "./schema";

export async function authenticate(email: string, password: string) {
  const db = database();

  const user = await db.query.user.findFirst({
    columns: {
      id: true,
      hashedPassword: true,
    },
    where: (user, { eq }) => eq(user.email, email),
  });
  if (!user) {
    return null;
  }

  const isValid = bcrypt.compareSync(password, user.hashedPassword);
  if (!isValid) {
    return null;
  }

  return { id: user.id };
}

export async function signup(email: string, password: string) {
  const db = database();

  const hashedPassword = bcrypt.hashSync(password, 10);

  const user = (
    await db
      .insert(schema.user)
      .values({
        email,
        hashedPassword,
      })
      .returning({ id: schema.user.id })
  )[0];

  return { id: user.id };
}
