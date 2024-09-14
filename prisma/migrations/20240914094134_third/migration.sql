/*
  Warnings:

  - You are about to drop the column `profilId` on the `social` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Social` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `social` DROP FOREIGN KEY `Social_profilId_fkey`;

-- AlterTable
ALTER TABLE `social` DROP COLUMN `profilId`,
    ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Social` ADD CONSTRAINT `Social_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
