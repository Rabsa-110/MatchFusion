// Check player count in DB - run from backend directory
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const prisma = new PrismaClient();

const count = await prisma.player.count();
console.log('Total players in DB:', count);

const sample = await prisma.player.findMany({ take: 5 });
console.log('Sample players:', JSON.stringify(sample.map(p => ({ id: p.id, name: p.name, sport: p.sport, teamId: p.teamId })), null, 2));

await prisma.$disconnect();

