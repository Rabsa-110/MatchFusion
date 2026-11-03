-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_postId_fkey";

-- DropForeignKey
ALTER TABLE "PollOption" DROP CONSTRAINT "PollOption_pollId_fkey";

-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_postId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_optionId_fkey";

-- AlterTable
ALTER TABLE "Poll" ADD COLUMN     "creatorId" TEXT,
ALTER COLUMN "matchStatus" SET DEFAULT 'ALL';

-- AlterTable
ALTER TABLE "Vote" ADD COLUMN     "pollId" TEXT;

-- CreateTable
CREATE TABLE "AIInsight" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "probHome" DOUBLE PRECISION,
    "probDraw" DOUBLE PRECISION,
    "probAway" DOUBLE PRECISION,
    "confidence" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "disclaimer" TEXT NOT NULL,
    "factorsJson" TEXT,
    "dataSnapshot" TEXT,
    "modelName" TEXT NOT NULL DEFAULT 'gemini-2.5-flash',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "provider" TEXT,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "country" TEXT,
    "sport" TEXT NOT NULL,
    "logo" TEXT,
    "competition" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "provider" TEXT,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "country" TEXT,
    "sport" TEXT NOT NULL,
    "position" TEXT,
    "role" TEXT,
    "image" TEXT,
    "statsJson" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teamId" TEXT,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIInsight_matchId_idx" ON "AIInsight"("matchId");

-- CreateIndex
CREATE INDEX "AIInsight_expiresAt_idx" ON "AIInsight"("expiresAt");

-- CreateIndex
CREATE INDEX "Team_sport_idx" ON "Team"("sport");

-- CreateIndex
CREATE UNIQUE INDEX "Team_sport_name_key" ON "Team"("sport", "name");

-- CreateIndex
CREATE INDEX "Player_sport_idx" ON "Player"("sport");

-- CreateIndex
CREATE INDEX "Player_name_idx" ON "Player"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_userId_pollId_key" ON "Vote"("userId", "pollId");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poll" ADD CONSTRAINT "Poll_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollOption" ADD CONSTRAINT "PollOption_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "PollOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIInsight" ADD CONSTRAINT "AIInsight_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
