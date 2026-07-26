/*
  Warnings:

  - The values [APPROVED] on the enum `PaperStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [ADMIN] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaperStatus_new" AS ENUM ('DRAFT', 'UNDER_MODERATION', 'REVISION_REQUIRED');
ALTER TABLE "Paper" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Paper" ALTER COLUMN "status" TYPE "PaperStatus_new" USING ("status"::text::"PaperStatus_new");
ALTER TYPE "PaperStatus" RENAME TO "PaperStatus_old";
ALTER TYPE "PaperStatus_new" RENAME TO "PaperStatus";
DROP TYPE "PaperStatus_old";
ALTER TABLE "Paper" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('DEPARTMENT_HEAD', 'LECTURER', 'MODERATOR');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
COMMIT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT,
ALTER COLUMN "department" DROP NOT NULL;
