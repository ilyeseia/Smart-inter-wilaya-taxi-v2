# 🚕 Smart Inter-Wilaya Taxi v2

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js 15">
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</p>

<p align="center">
  <strong>🇩🇿 منصة ذكية لربط السائقين بالركاب في رحلات بين الولايات الجزائرية</strong>
</p>

<p align="center">
  <a href="#features">المميزات</a> •
  <a href="#demo">عرض تجريبي</a> •
  <a href="#installation">التثبيت</a> •
  <a href="#tech-stack">التقنيات</a> •
  <a href="#contributing">المساهمة</a>
</p>

---

## 🌟 Features | المميزات

### 🎨 تصميم مميز
- **Sahara Elegance Theme** - تصميم مستوحى من دفء الصحراء الجزائرية
- ألوان التراكوتا والعنبر مع لمسات تركوازية
- دعم كامل للغة العربية (RTL)
- وضع داكن/فاتح

### 🚀 واجهة رئيسية جذابة
- صفحة هبوط متحركة مع رسوم متحركة سلسة
- عرض الطرق الشائعة بتصميم أنيق
- بطاقات سائقين تفاعلية
- إحصائيات متحركة

### 📊 لوحة تحكم متكاملة
- إدارة السائقين
- تتبع المجموعات
- تحليلات وإحصائيات
- إعدادات المسؤول

## 🖥️ Demo | عرض تجريبي

![Smart Taxi Demo](https://via.placeholder.com/800x400/1a1a2e/ffffff?text=Smart+Inter-Wilaya+Taxi+v2)

## 🛠️ Installation | التثبيت

```bash
# Clone the repository
git clone https://github.com/yourusername/smart-inter-wilaya-taxi-v2.git

# Navigate to project directory
cd smart-inter-wilaya-taxi-v2

# Install dependencies
bun install

# Run development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Tech Stack | التقنيات

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React Framework |
| **TypeScript** | Type Safety |
| **Tailwind CSS 4** | Styling |
| **shadcn/ui** | UI Components |
| **Lucide Icons** | Icons |
| **Prisma** | Database ORM |

## 📁 Project Structure | هيكل المشروع

```
smart-inter-wilaya-taxi-v2/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main page
│   │   ├── layout.tsx        # Root layout
│   │   ├── globals.css       # Global styles
│   │   └── api/              # API routes
│   ├── components/
│   │   ├── ui/               # UI components (shadcn)
│   │   └── taxi/             # Taxi-specific components
│   ├── lib/
│   │   ├── constants.ts      # App constants
│   │   ├── types.ts          # TypeScript types
│   │   └── utils.ts          # Utility functions
│   └── hooks/                # Custom hooks
├── public/                   # Static assets
└── prisma/                   # Database schema
```

## 🎨 Design System | نظام التصميم

### Colors | الألوان

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| **Primary** | Terracotta `oklch(0.55 0.18 45)` | Golden `oklch(0.75 0.16 55)` | Buttons, accents |
| **Accent** | Teal `oklch(0.6 0.15 180)` | Bright Teal `oklch(0.7 0.16 180)` | Highlights, badges |
| **Background** | Warm Cream | Deep Navy | Page backgrounds |

### Typography | الخطوط

- **Headings**: Playfair Display (elegant serif)
- **Body**: Outfit (modern sans-serif)
- **Arabic**: Amiri (traditional Arabic serif)

## 🌐 Languages | اللغات

- 🇩🇿 **Arabic** (العربية) - Full RTL support
- 🇫🇷 **French** (Français)

## 📱 Responsive Design

- ✅ Mobile-first approach
- ✅ Tablet optimization
- ✅ Desktop enhancements
- ✅ Adaptive layouts

## 🚀 Deployment | النشر

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```bash
# Build image
docker build -t smart-taxi-v2 .

# Run container
docker run -p 3000:3000 smart-taxi-v2
```

## 🤝 Contributing | المساهمة

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License | الرخصة

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author | المؤلف

**Smart Inter-Wilaya Taxi Team**

- Website: [https://smart-inter-wilaya-taxi-v2.vercel.app](https://smart-inter-wilaya-taxi-v2.vercel.app)
- GitHub: [@ilyeseia](https://github.com/ilyeseia)

## 🙏 Acknowledgments | شكر وتقدير

- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Lucide](https://lucide.dev/) - Beautiful icons

---

<p align="center">
  Made with ❤️ in 🇩🇿 Algeria
</p>
