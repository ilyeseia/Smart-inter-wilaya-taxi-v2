/**
 * AI Assistant API Route
 * Smart Inter-Wilaya Taxi v2
 * 
 * Provides AI-powered assistant capabilities using z-ai-web-dev-sdk LLM
 */

import { NextRequest } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { withMiddleware, successResponse, ValidationError, RateLimitError } from '@/lib/api-utils';
import { z } from 'zod';

// Validation schema
const assistantSchema = z.object({
  message: z.string().min(1).max(1000),
  context: z.enum(['general', 'booking', 'route', 'driver', 'support']).default('general'),
  language: z.enum(['ar', 'fr']).default('ar'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).max(10).optional(),
});

// System prompts for different contexts
const systemPrompts: Record<string, Record<string, string>> = {
  general: {
    ar: `أنت مساعد ذكي لمنصة "سمارت تاكسي" للنقل بين الولايات الجزائرية.
 مهمتك مساعدة المستخدمين في:
- حجز رحلات التاكسي بين المدن الجزائرية
- البحث عن السائقين المتاحين
- الاستفسار عن الأسعار والمسارات
- تقديم معلومات عن الخدمات

كن ودوداً ومختصراً. أجب بالعربية دائماً.
المعلومات الرئيسية:
- تغطي 48 ولاية جزائرية
- الأسعار تبدأ من 1500 دج للرحلات القصيرة
- تتوفر خيارات الدفع نقداً أو إلكترونياً`,
    fr: `Vous êtes un assistant intelligent pour la plateforme "Smart Taxi" de transport inter-wilayas en Algérie.
Votre mission est d'aider les utilisateurs avec:
- Réservation de trajets taxi entre villes
- Recherche de chauffeurs disponibles
- Informations sur les prix et itinéraires

Soyez amical et concis. Répondez en français.
Informations clés:
- Couverture de 48 wilayas
- Prix à partir de 1500 DA`,
  },
  booking: {
    ar: `أنت مساعد حجز متخصص في منصة سمارت تاكسي.
ساعد المستخدمين في إكمال حجوزاتهم:
1. اسأل عن نقطة الانطلاق والوجهة
2. حدد التاريخ والوقت المفضل
3. اعرض الخيارات المتاحة
4. أكد الحجز

كن دقيقاً ومباشراً.`,
    fr: `Vous êtes un assistant de réservation pour Smart Taxi.
Aidez les utilisateurs à compléter leurs réservations:
1. Demandez le départ et la destination
2. Confirmez date et heure
3. Présentez les options
4. Confirmez la réservation`,
  },
  route: {
    ar: `أنت مساعد متخصص في المسارات والطرق في الجزائر.
قدم معلومات عن:
- المسافات بين المدن
- أوقات السفر المتوقعة
- الأسعار التقريبية
- أفضل الطرق

الطرق الشائعة:
- الجزائر - وهران: 400 كم، ~4 ساعات، 2500 دج
- الجزائر - قسنطينة: 320 كم، ~3 ساعات، 2000 دج
- الجزائر - سطيف: 280 كم، ~3 ساعات، 1800 دج`,
    fr: `Vous êtes un expert en itinéraires en Algérie.
Fournissez des informations sur:
- Distances entre villes
- Temps de trajet
- Prix approximatifs

Routes populaires:
- Alger - Oran: 400 km, ~4h, 2500 DA
- Alger - Constantine: 320 km, ~3h, 2000 DA`,
  },
  driver: {
    ar: `أنت مساعد للسائقين في منصة سمارت تاكسي.
ساعد السائقين في:
- فهم سياسات المنصة
- تحسين تقييماتهم
- إدارة رحلاتهم
- زيادة أرباحهم

نصائح مهمة:
- استجب سريعاً لطلبات الحجز
- حافظ على نظافة المركبة
- التزم بالمواعيد`,
    fr: `Vous êtes un assistant pour les chauffeurs Smart Taxi.
Aidez les chauffeurs avec:
- Politiques de la plateforme
- Amélioration des évaluations
- Gestion des trajets`,
  },
  support: {
    ar: `أنت موظف دعم عملاء لمنصة سمارت تاكسي.
تعامل مع:
- الشكاوى والاستفسارات
- مشاكل الحجز والدفع
- طلبات الاسترداد
- الملاحظات والاقتراحات

كن صبوراً ومتفهماً. قد حلولاً عملية.`,
    fr: `Vous êtes un agent du service client Smart Taxi.
Gérez:
- Réclamations et questions
- Problèmes de réservation/paiement
- Demandes de remboursement`,
  },
};

// Rate limiting
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(identifier: string, maxRequests: number = 30, windowMs: number = 60000) {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  if (!record || record.resetAt <= now) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

/**
 * AI Assistant Handler
 */
async function assistantHandler(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rateCheck = checkRateLimit(ip, 30, 60000);
  
  if (!rateCheck.allowed) {
    throw new RateLimitError('Too many requests. Please wait a moment.', 60);
  }
  
  // Parse request body
  const body = await request.json();
  const params = assistantSchema.parse(body);
  
  // Get appropriate system prompt
  const systemPrompt = systemPrompts[params.context]?.[params.language] 
    || systemPrompts.general[params.language];
  
  // Build messages array
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
  ];
  
  // Add conversation history
  if (params.history && params.history.length > 0) {
    for (const msg of params.history) {
      messages.push({ role: msg.role, content: msg.content });
    }
  }
  
  // Add current message
  messages.push({ role: 'user', content: params.message });
  
  // Initialize Z-AI SDK and call LLM
  const zai = await ZAI.create();
  
  const completion = await zai.chat.completions.create({
    messages,
    temperature: 0.7,
    max_tokens: 500,
  });
  
  const responseMessage = completion.choices[0]?.message?.content || '';
  
  return successResponse({
    message: responseMessage,
    context: params.context,
    language: params.language,
  });
}

export const POST = withMiddleware(assistantHandler, {
  rateLimit: { max: 30, windowMs: 60000 },
  logRequests: true,
});
