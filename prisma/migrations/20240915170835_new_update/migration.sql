/*
  Warnings:

  - You are about to drop the column `projectId` on the `media` table. All the data in the column will be lost.
  - You are about to drop the `project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `projetrequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rating` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `media` DROP FOREIGN KEY `Media_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `project` DROP FOREIGN KEY `Project_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `project` DROP FOREIGN KEY `Project_creatorId_fkey`;

-- DropForeignKey
ALTER TABLE `projetrequest` DROP FOREIGN KEY `ProjetRequest_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `projetrequest` DROP FOREIGN KEY `ProjetRequest_creatorId_fkey`;

-- DropForeignKey
ALTER TABLE `rating` DROP FOREIGN KEY `Rating_profilId_fkey`;

-- DropForeignKey
ALTER TABLE `rating` DROP FOREIGN KEY `Rating_userId_fkey`;

-- AlterTable
ALTER TABLE `media` DROP COLUMN `projectId`;

-- DropTable
DROP TABLE `project`;

-- DropTable
DROP TABLE `projetrequest`;

-- DropTable
DROP TABLE `rating`;
