// @ts-nocheck
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

// Güvenilir placeholder görseller (picsum sabit seed)
const IMG = (seed, w = 800, h = 600) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error('Kullanıcı bulunamadı. Önce kayıt olun.');
  console.log('Kullanıcı:', user.email);

  // Önceki kayıt varsa temizle
  const existing = await prisma.site.findUnique({ where: { slug: 'dentasmile' } });
  if (existing) {
    await prisma.slide.deleteMany({ where: { siteId: existing.id } });
    await prisma.product.deleteMany({ where: { siteId: existing.id } });
    await prisma.newsPost.deleteMany({ where: { siteId: existing.id } });
    await prisma.sitePage.deleteMany({ where: { siteId: existing.id } });
    await prisma.site.delete({ where: { id: existing.id } });
    console.log('Önceki kayıt silindi.');
  }

  /* ── Site ──────────────────────────────────── */
  const site = await prisma.site.create({
    data: {
      userId: user.id,
      slug: 'dentasmile',
      name: 'DentaSmile Diş Kliniği',
      tagline: 'Sağlıklı gülüşler için modern diş hekimliği',
      intro:
        'İstanbul Şişli\'de 15 yılı aşkın deneyimimizle ağız ve diş sağlığınız için en ileri teknolojileri kullanıyoruz. Uzman kadromuz ve konforlu ortamımızla her yaştan hastamıza güvenilir tedavi sunuyoruz.',
      themeKey: 'serenity',
      contactEmail: 'info@dentasmile.com.tr',
      contactPhone: '0212 444 38 75',
      address: 'Halaskargazi Cad. No:42, Şişli / İstanbul',
      seoDescription:
        'DentaSmile Diş Kliniği — İstanbul Şişli\'de implant, ortodonti, zirkonyum ve estetik diş tedavileri.',
      published: true,
      menuConfig: JSON.stringify([
        { key: 'urunler', label: 'Hizmetler', path: 'urunler', enabled: true },
        { key: 'news', label: 'Blog', path: 'blog', enabled: true },
        { key: 'iletisim', label: 'İletişim', path: 'iletisim', enabled: true },
      ]),
    },
  });
  console.log('Site oluşturuldu:', site.slug, '→', site.id);

  /* ── Uploads klasörü ───────────────────────── */
  const dir = `public/uploads/${site.id}`;
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });

  /* ── Hizmetler (Products) ──────────────────── */
  const services = [
    {
      title: 'Diş Beyazlatma',
      slug: 'dis-beyazlatma',
      price: 2500,
      category: 'Estetik Diş Hekimliği',
      sortOrder: 0,
      imageUrl: IMG('dentwhite', 800, 600),
      description:
        'Zoom teknolojisi ile klinik ortamda diş beyazlatma. Tek seansta 6-8 ton açılma sağlar. Hassas dişlere özel jel ile güvenli uygulama. Sonuçlar 1-2 yıl kalıcıdır.',
    },
    {
      title: 'Zirkonyum Kaplama',
      slug: 'zirkonyum-kaplama',
      price: 3500,
      category: 'Estetik Diş Hekimliği',
      sortOrder: 1,
      imageUrl: IMG('zirconia', 800, 600),
      description:
        'Metal içermeyen, doğal görünümlü zirkonyum porselen kaplamalar. Uzun ömürlü, sağlam ve estetik çözüm. Renk değişmez, alerjik reaksiyon yaratmaz.',
    },
    {
      title: 'Dental İmplant',
      slug: 'dental-implant',
      price: 12000,
      category: 'İmplant',
      sortOrder: 2,
      imageUrl: IMG('implant', 800, 600),
      description:
        'Nobel Biocare ve Straumann sistemleriyle kayıp dişlerin en kalıcı çözümü. Tek seans hızlı implant seçeneği mevcuttur. 15 yıl garanti. CBCT destekli dijital planlama.',
    },
    {
      title: 'Şeffaf Plak Ortodonti',
      slug: 'seffaf-plak-ortodonti',
      price: 18000,
      category: 'Ortodonti',
      sortOrder: 3,
      imageUrl: IMG('orthodontic', 800, 600),
      description:
        'Invisalign ve 3M Clarity Aligner sistemleriyle tel görünmeden tedavi. Çıkarılabilir olduğundan yemede sorun çıkarmaz. Her 2 haftada bir yeni plak ile ilerleme kaydedilir.',
    },
    {
      title: 'Kanal Tedavisi',
      slug: 'kanal-tedavisi',
      price: 1800,
      category: 'Genel Diş Hekimliği',
      sortOrder: 4,
      imageUrl: IMG('rootcanal', 800, 600),
      description:
        'Rotary nikel-titanyum sistemler ve mikroskop destekli uygulamayla ağrısız ve hızlı kanal tedavisi. Dişinizi çektirmeden kurtarın.',
    },
    {
      title: 'Profesyonel Diş Temizliği',
      slug: 'profesyonel-dis-temizligi',
      price: 750,
      category: 'Koruyucu Diş Hekimliği',
      sortOrder: 5,
      imageUrl: IMG('cleaning', 800, 600),
      description:
        'Ultrasonik sistem ile diş taşı temizliği ve parlatma. 6 ayda bir önerilir. Diş eti hastalıklarını önler. Ağız hijyeni eğitimi ve fırçalama teknikleri rehberliği dahildir.',
    },
  ];

  for (const s of services) {
    await prisma.product.create({ data: { siteId: site.id, ...s, published: true } });
    process.stdout.write(`  ✓ ${s.title}\n`);
  }

  /* ── Haberler ──────────────────────────────── */
  const news = [
    {
      title: 'İmplant Tedavisinde 2024 Teknolojileri: Ne Değişti?',
      slug: 'implant-tedavisinde-2024-teknolojileri',
      excerpt:
        'Hızlı implant sistemleri ve dijital planlama yazılımları sayesinde artık tek seansta implant mümkün. İşte son gelişmeler.',
      body: `<h2>Dijital Planlama ile Daha Güvenli İmplant</h2>
<p>CBCT (Konik Işınlı Bilgisayarlı Tomografi) ve 3D planlama yazılımları, implant cerrahisini kökten değiştirdi. Operasyon öncesinde sanal simülasyon yapılarak en uygun implant pozisyonu belirleniyor.</p>
<h2>Tek Seans İmplant Mümkün mü?</h2>
<p>Kemik kalitesi yeterli olan hastalarda "immediate loading" protokolüyle aynı gün geçici kuron takılabiliyor. Bu, iyileşme sürecini büyük ölçüde konforlu hale getiriyor.</p>
<h2>Kliniğimizde Kullandığımız Sistemler</h2>
<p>Nobel Biocare ve Straumann sistemlerini kullanan kliniğimizde her implant vakası bilgisayar destekli kılavuzla planlanmaktadır. 15 yıl garanti sunuyoruz.</p>`,
      coverImageUrl: IMG('implant2', 1200, 700),
      published: true,
      publishedAt: new Date('2024-03-15'),
    },
    {
      title: 'Şeffaf Plak Tedavisi Kimler İçin Uygun?',
      slug: 'seffaf-plak-tedavisi-kimler-icin-uygun',
      excerpt:
        'Geleneksel tel yerine şeffaf plak tercih etmek isteyenlerin merak ettiği sorulara ortodontistimiz cevap verdi.',
      body: `<h2>Şeffaf Plak Nedir?</h2>
<p>Şeffaf plak (clear aligner) tedavisi, dişleri şeffaf ve çıkarılabilir plastik kalıplarla düzelten modern bir ortodontik yöntemdir.</p>
<h2>Kimler Kullanabilir?</h2>
<p>Hafif-orta derecede çapraşıklık, aralıklı dişler ve bazı ısırma bozuklukları için idealdir. Ağır vakalarda geleneksel tel tedavisi tercih edilebilir.</p>
<h2>Avantajları</h2>
<ul><li>Görünmez tedavi</li><li>Çıkarılabilir olduğundan yemekte sorun çıkarmaz</li><li>Daha kolay ağız hijyeni</li><li>Daha az rahatsızlık</li></ul>`,
      coverImageUrl: IMG('smile', 1200, 700),
      published: true,
      publishedAt: new Date('2024-02-08'),
    },
    {
      title: 'Çocuklarda İlk Diş Hekimi Ziyareti Ne Zaman Olmalı?',
      slug: 'cocuklarda-ilk-dis-hekimi-ziyareti',
      excerpt:
        'Uzmanlar, ilk diş muayenesinin 1 yaşında veya ilk dişin çıkmasından hemen sonra yapılmasını öneriyor.',
      body: `<h2>Erken Muayene Neden Önemli?</h2>
<p>Çocuğunuzun dişlerinin sağlıklı gelişmesi için erken müdahale çok önemlidir. İlk diş muayenesi, ilk dişin çıkmasından sonraki 6 ay içinde yapılmalıdır.</p>
<h2>Süt Dişleri Neden Önemli?</h2>
<p>Süt dişleri çürüdüğünde altındaki kalıcı diş de etkilenebilir. Ayrıca çiğneme, konuşma ve yüz gelişimi açısından kritik öneme sahiptir.</p>
<h2>Kliniğimizde Pedodonti</h2>
<p>Çocuk diş hekimliği biriminde çocuk dostu bir ortam sunuyoruz. Korkusuz ve keyifli bir deneyim için randevu alın.</p>`,
      coverImageUrl: IMG('pediatric', 1200, 700),
      published: true,
      publishedAt: new Date('2024-01-20'),
    },
  ];

  for (const post of news) {
    await prisma.newsPost.create({ data: { siteId: site.id, ...post } });
    process.stdout.write(`  ✓ ${post.title}\n`);
  }

  /* ── Hakkımızda sayfası ────────────────────── */
  const page = await prisma.sitePage.create({
    data: {
      siteId: site.id,
      title: 'Hakkımızda',
      slug: 'hakkimizda',
      published: true,
      sortOrder: 0,
      body: `<h2>Kliniğimiz Hakkında</h2>
<p>DentaSmile Diş Kliniği, 2009 yılında İstanbul Şişli'de kurulmuştur. 15 yılı aşkın deneyimimizle on binlerce hastaya hizmet verdik. Amacımız; en güncel teknolojileri kullanarak ağrısız ve konforlu bir tedavi deneyimi sunmak.</p>
<h2>Ekibimiz</h2>
<ul>
  <li><strong>Dr. Ayşe Yıldız</strong> — Ortodonti Uzmanı, İstanbul Üniversitesi</li>
  <li><strong>Dr. Mert Kaya</strong> — İmplantoloji Uzmanı, Cerrahpaşa Tıp Fakültesi</li>
  <li><strong>Dr. Selin Demir</strong> — Estetik Diş Hekimliği, Florence Nightingale Hastanesi</li>
</ul>
<h2>Teknolojimiz</h2>
<p>CBCT (3D diş tomografisi), dijital röntgen, CAD/CAM sistemi, Zoom beyazlatma cihazı ve mikroskop destekli endodonti ile doğru teşhis ve üstün tedavi kalitesi sunuyoruz.</p>`,
    },
  });

  /* Menüye Hakkımızda ekle */
  const menuWithPage = [
    { key: `page:${page.id}`, label: 'Hakkımızda', path: `sayfa/hakkimizda`, enabled: true },
    ...JSON.parse(site.menuConfig || '[]'),
  ];
  await prisma.site.update({
    where: { id: site.id },
    data: { menuConfig: JSON.stringify(menuWithPage) },
  });

  console.log('\n✅ Tamamlandı!');
  console.log('🌐 Site:', `http://localhost:3000/s/dentasmile`);
  console.log('🔧 Panel:', `http://localhost:3000/dashboard/${site.id}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
