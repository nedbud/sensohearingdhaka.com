/**
 * All user-facing copy, in Bangla and English.
 *
 * Bangla is the default because the patient and the family member deciding
 * for them read Bangla. English exists for the adult children who search in
 * English, for expatriate relatives, and for doctor referrals.
 *
 * Register: cholito bhasha, আপনি, and the -উন imperative (করুন, আসুন).
 * Sadhu bhasha reads like a government circular and is never used.
 *
 * Terminology: the headline word is কানের মেশিন, not শ্রবণযন্ত্র. The formal
 * word is medically correct and almost nobody searches it.
 */

/**
 * Every value in the dictionary below is a string, an array or an object of
 * them — never a function.
 *
 * Three entries used to be functions: `hero.openUntil(h)`, `hero.opensAt(day,
 * h)` and `wa.product(name)`. That was fine while the dictionary never left
 * the server, and it stopped being fine the moment the pages started handing
 * `d` to client components — React cannot serialise a function across that
 * boundary, and the build failed on 232 pages with "Functions cannot be passed
 * directly to Client Components".
 *
 * They are {placeholder} templates now, filled by fill(). Which also means
 * they can be edited in the CMS like every other string; a function never
 * could be.
 */
export type Lang = "bn" | "en";
export const LANGS: Lang[] = ["bn", "en"];
export const DEFAULT_LANG: Lang = "bn";

export const t = {
  bn: {
    nav: {
      home: "হোম",
      products: "কানের মেশিন",
      tests: "কান পরীক্ষা",
      service: "সার্ভিস",
      accessories: "যন্ত্রাংশ",
      gallery: "গ্যালারি",
      sections: "এই পাতার অংশ",
      about: "আমরা কারা",
      visit: "কোথায় আসবেন",
      call: "ফোন করুন",
      whatsapp: "হোয়াটসঅ্যাপ",
    },

    hero: {
      eyebrow: "পান্থপথ, ঢাকা · ReSound-এর অনুমোদিত ডিলার",
      // Opens on the delay, not the product. Average time from noticing
      // hearing loss to seeking help is 4-10 years, and most people who
      // have not acted believe their loss is only mild. Naming the delay
      // turns guilt into permission.
      title: "কানে কম শুনছেন?",
      // {minutes} is the assessment time from the clinic record, so the
      // sentence and the fee table cannot drift apart.
      lede: "শুরুটা হোক একটা পরীক্ষা দিয়ে। {minutes} মিনিট, তারপর রিপোর্ট হাতে। মেশিন নেওয়ার সিদ্ধান্ত তার পরে।",
      phoneShort: "ফোনে কষ্ট হলে লিখে পাঠান — আমাদের বেশিরভাগ রোগীর জন্যই ফোন কঠিন।",
      deviceAlt: "ReSound OMNIA ৪৬১ কানের মেশিন — মূল অংশ কানের পেছনে, স্পিকার সরু তার দিয়ে কানের ভেতরে",
      deviceCaption: "ReSound OMNIA ৪৬১ · ",
      everyModel: "সব মডেল ও দাম",
      ctaWhatsapp: "হোয়াটসঅ্যাপে লিখুন",
      ctaCall: "ফোন করুন",
      // The differentiator. A hearing clinic whose only CTA is "call us"
      // asks its hardest-to-convert visitors to do the thing their
      // condition makes hardest.
      phoneNoteTitle: "ফোনে কথা বলতে কষ্ট হয়?",
      phoneNote:
        "লিখে পাঠান। আমাদের বেশিরভাগ রোগীর জন্যই ফোন কঠিন — সেজন্যই তো তাঁরা আমাদের কাছে আসেন। হোয়াটসঅ্যাপ, মেসেঞ্জার, অথবা সরাসরি চলে আসুন।",
      openNow: "এখন খোলা",
      closedNow: "এখন বন্ধ",
      openUntil: "{hour} পর্যন্ত খোলা",
      opensAt: "{day} {hour}-এ খুলবে",
      tomorrow: "আগামীকাল",
      hoursFallback: "শনি – বৃহস্পতি, সকাল ১০টা – রাত ৮টা · শুক্রবার বন্ধ",
    },

    products: {
      heading: "কোন মেশিন, কত দাম",
      lede: "কম শোনার মাত্রা যত বেশি, মেশিনের ক্ষমতা তত বেশি লাগে — দামের পার্থক্যটা এখান থেকেই। কোনটা আপনার লাগবে, ঠিক হয় অডিওগ্রামের পর।",
      all: "সব মেশিন দেখুন",
      from: "থেকে শুরু",
      series: "সিরিজ",
      brand: "ব্র্যান্ড",
      price: "দাম",
      details: "বিস্তারিত",
      askPrice: "এই মেশিনটি নিয়ে জানতে চাই",
      empty: "এই সিরিজে এখন কোনো মেশিন নেই।",
      sortBy: "সাজান",
      filterSeries: "সিরিজ",
      allSeries: "সব",
    },

    faq: { heading: "আরও কিছু প্রশ্ন" },

    // Test fees. {n} is the minute count, {age} the lowest age the listed
    // tests are done at, {days} the in-house repair turnaround — each filled
    // from the row or the clinic record it belongs to, so a price rise is a
    // number in the panel and not a sentence rewritten here.
    tests: {
      heading: "পরীক্ষার ফি ও সময়",
      lede: "প্রেসক্রিপশন না থাকলেও চলবে — অডিওলজিস্ট দেখে বলে দেবেন কোনটা লাগবে।",
      allThree: "তিনটি একসাথে",
      minutes: "{n} মিনিট",
      reportNote:
        "রিপোর্ট কিছুক্ষণের মধ্যেই। {age} বছরের বেশি বয়সীদের জন্য — ছোট শিশুদের জন্য আলাদা ব্যবস্থা আছে।",
      prescriptionCta: "প্রেসক্রিপশন দেখান",
      serviceLead: "সার্ভিস ও যন্ত্রাংশ —",
      serviceNote:
        "{brand} মেশিন বিদেশ থেকে কেনা হলেও সার্ভিস করি, নিজস্ব ল্যাবে সাধারণত {days} দিনে। যন্ত্রাংশ কুরিয়ারে পাঠানো যায়।",
    },

    trust: {
      heading: "{brand}-এর অনুমোদিত ডিলার",
      lede:
        "বাংলাদেশের ডিলার হিসেবে {brand} তাদের নিজেদের ওয়েবসাইটে আমাদের নাম দিয়েছে — নিচের লিংকে দেখে নিতে পারেন।",
      about: "আমাদের সম্পর্কে",
      verify: "{brand}-এর তালিকায় দেখুন",
      sinceLabel: "পান্থপথে",
      sinceValue: "{year} সাল থেকে",
      warrantyLabel: "ওয়ারেন্টি",
      warrantyValue: "{years} বছর, {months} মাস পরপর ফলো-আপ",
      hospitalsLabel: "যেসব হাসপাতালের সাথে কাজ",
      whoSits: "কে কখন বসেন",
    },

    // The three-figure strip under the headline.
    strip: {
      devices: "মেশিন",
      devicesNote: "থেকে",
      fullTest: "পূর্ণ পরীক্ষা",
      openNow: "এখন খোলা",
      closedNow: "এখন বন্ধ",
      openNote: "পর্যন্ত · শুক্র বন্ধ",
      tomorrow: "আগামীকাল",
      daysFallback: "শনি – বৃহস্পতি",
    },

    /**
     * The About page. `steps` and `limits` are newline-separated lists so the
     * panel edits them as a textarea — a person adding a sixth step should not
     * need a developer to add a sixth key. In `steps` each line is a title and
     * its sentence, split on the first " — ".
     */
    about: {
      eyebrow: "আমরা কারা",
      title: "কান পরীক্ষা করে, মেশিন বসিয়ে, তারপর পাশে থাকা।",
      lede: "পান্থপথে {year} সাল থেকে। কানের মেশিন বিক্রি করা আমাদের কাজের একটা অংশ মাত্র — বাকিটা হলো ঠিক মেশিনটা বেছে দেওয়া, ঠিকভাবে বসানো, আর তারপর বছরের পর বছর সেটা ঠিক রাখা।",
      yearsUnit: "বছর",
      sinceLabel: "{year} সাল থেকে",
      dealerLabel: "অনুমোদিত ডিলার",
      hospitalsLabel: "হাসপাতালের সাথে কাজ",
      warrantyLabel: "ওয়ারেন্টি",
      stepsHeading: "এখানে যা যা হয়",
      steps:
        "পরীক্ষা — PTA, Tympanometry ও Speech — {minutes} মিনিটে রিপোর্ট হাতে।\nমেশিন ঠিক করা — অডিওগ্রাম দেখে কোন ক্ষমতার মেশিন লাগবে ঠিক করা হয় — কানে দিয়ে শুনে দেখতে পারবেন।\nইয়ার মোল্ড — আপনার কানের ছাঁচ নিয়ে নিজস্ব ল্যাবে তৈরি। ঠিকমতো না বসলে ভালো মেশিনও কাজ করে না।\nফিটিং ও যাচাই — কানের ভেতরে আসলে কতটুকু শব্দ পৌঁছাচ্ছে সেটা মেপে সেট করা হয় — বাক্সের গায়ে কী লেখা তা দিয়ে নয়।\nএরপরও পাশে — প্রতি {months} মাসে ফলো-আপ ও টিউনিং। সার্ভিস, ব্যাটারি, যন্ত্রাংশ — সবই এখানে।",
      peopleHeading: "যাঁদের কাছে আসছেন",
      peopleLede: "নির্দিষ্ট কারও কাছে আসতে চাইলে হোয়াটসঅ্যাপে বলে সিরিয়াল নিয়ে নিন।",
      verifyHeading: "যাচাই করে নিন",
      verifyLede:
        "বাংলাদেশের ডিলার হিসেবে {brand} তাদের নিজেদের ওয়েবসাইটে আমাদের নাম দিয়েছে। ঢাকার আর কোনো হিয়ারিং সেন্টার সম্পর্কে এই কথাটা যাচাই করা যায় না।",
      awardCaption: "Business Excellence Award, 2019",
      limitsHeading: "যা আমরা করি না",
      limitsLede: "আসার আগে জেনে রাখলে দুই পক্ষেরই সময় বাঁচে।",
      limits:
        "আমরা শুধু {brand}-এর ডিলার — Signia, Phonak বা Oticon মেশিন আমরা বিক্রি বা সার্ভিস করি না।\nকিস্তি বা EMI-এর ব্যবস্থা এখন নেই। কার্ড, বিকাশ ও বাংলা QR চলে।\nএকবার বিক্রি হয়ে গেলে মেশিন ফেরত নেওয়া হয় না — তাই কেনার আগেই শুনে, প্রশ্ন করে নিশ্চিত হয়ে নিন।\nঢাকার বাইরে আমাদের নিজস্ব শাখা নেই। ডিলার পয়েন্ট আছে, আর যন্ত্রাংশ কুরিয়ারে পাঠানো যায়।",
      whereHeading: "কোথায় আসবেন",
      naatiCta: "নাতির সঙ্গে কথা বলুন",
    },

    privacy: {
      title: "গোপনীয়তা ও তথ্য",
      intro: "এই পাতায় লেখা আছে আমরা আপনার কী কী তথ্য নিই, কেন নিই, কোথায় রাখি, কতদিন রাখি, আর আপনি না চাইলে কী করবেন। সোজা কথায় লেখার চেষ্টা করেছি।",
      updated: "সর্বশেষ হালনাগাদ: সেপ্টেম্বর ২০২৬",
      // The whole notice in one field, so it can be read and edited as the
      // document it is rather than as thirty disconnected rows. A line that
      // begins "## " opens a section; every other line is a paragraph.
      body: "## কী কী নিই\nআপনি চ্যাটে যা লেখেন — প্রশ্ন, সমস্যার বর্ণনা, যা কিছু।\nপ্রেসক্রিপশন, রিপোর্ট বা মেশিনের ছবি, যদি আপনি পাঠান।\nসিরিয়াল নিতে চাইলে: আপনার নাম আর ফোন নম্বর। রোগীর বয়স ১৮-র নিচে হলে অভিভাবকের নাম।\nএর বাইরে কিছু চাই না। ইমেইল, ঠিকানা, জাতীয় পরিচয়পত্র — কোনোটাই না।\n## কেন নিই\nআপনার প্রশ্নের উত্তর দিতে, আর সিরিয়াল বসাতে। এই দুটোই।\nবিজ্ঞাপনের জন্য নয়। কারো কাছে বিক্রি করি না, কারো সাথে ভাগ করি না।\n## কোথায় যায়\nনাম, ফোন আর সিরিয়াল যায় সেনসোর নিজের সিস্টেমে। শুধু আমাদের লোকজন দেখেন।\nচ্যাটের লেখা আর ছবি পড়ার জন্য আমরা Google-এর একটি সেবা ব্যবহার করি, যার সার্ভার বাংলাদেশের বাইরে। ছবি পড়া হয়, উত্তর দেওয়া হয়, তারপর আমরা সেটা কোথাও জমা রাখি না।\nপ্রেসক্রিপশনে সাধারণত নাম, বয়স আর রোগের কথা লেখা থাকে। তাই ছবি পাঠানোর আগে এটুকু জেনে রাখা দরকার — আর না পাঠাতে চাইলে লিখে বললেও আমরা একইভাবে সাহায্য করব।\n## কতদিন থাকে\nছবি কোথাও জমা রাখা হয় না — পড়া হয়, উত্তর দেওয়া হয়, ব্যস।\nচ্যাটের কথা শুধু আপনার নিজের ব্রাউজারে থাকে, যতক্ষণ ট্যাবটা খোলা। আমাদের সার্ভারে চ্যাট জমা হয় না।\nসিরিয়ালের সাথে আপনি যে সমস্যার কথা লিখেছিলেন, সেটা ১৮০ দিন পরে মুছে ফেলা হয়। সিরিয়ালের হিসাবটা থাকে, কারণ সেটা ক্লিনিকের খাতার অংশ।\nযে সিরিয়াল কখনো নিশ্চিত হয়নি আর দিনটাও পেরিয়ে গেছে, সেটা ৯০ দিন পরে মুছে যায়।\nআপনি যদি সেনসোর রোগী হয়ে থাকেন, আপনার রোগীর রেকর্ড হিসাব-নিকাশের নিয়ম অনুযায়ী রাখতে হয় — সেটা এই ওয়েবসাইটের ব্যাপার নয়।\n## শিশুদের বেলায়\n১৮ বছরের নিচে কারো পরীক্ষার সিরিয়াল তার বাবা-মা বা অভিভাবক নেবেন, আর আমরা তাঁর নামটা লিখে রাখি।\nশিশুর জন্মতারিখ আমরা চাই না।\n## আপনি না চাইলে\nছবি না পাঠিয়ে শুধু লিখেও সব জানতে পারবেন।\nআপনার তথ্য মুছে দিতে বললে মুছে দেব। ফোন করে বা ইমেইল করে বললেই হবে।\nকী কী আছে জানতে চাইলে বলুন, দেখিয়ে দেব।\n## যা আমরা করি না\nআপনাকে ইন্টারনেটে অনুসরণ করার কোনো ট্র্যাকার এই সাইটে নেই।\nআপনার তথ্য দিয়ে কোনো বিজ্ঞাপন দেখানো হয় না।\nনাতি ডাক্তার নয় — রোগ নির্ণয় করে না, ওষুধ নিয়ে কথা বলে না।",
      contactHeading: "কার সাথে কথা বলবেন",
      contactLede: "তথ্য নিয়ে কিছু জানার বা মোছার থাকলে সেনসো হিয়ারিং সেন্টারে বলুন:",
      back: "← সাইটে ফিরে যান",
    },

    /**
     * The catalogue: the filter bar, the "which one suits you" panel, the
     * pager, and the two empty states. Anything with a figure in it is a
     * {placeholder} template — see fill().
     */
    catalogue: {
      partsTitle: "ব্যাটারি ও যন্ত্রাংশ",
      partsLede: "ব্যাটারি, ডোম, রিসিভার, ওয়াক্স গার্ড — যা যা লাগে। মেশিনের ছবি পাঠালে আমরা বলে দিতে পারি কোনটা আপনার লাগবে।",
      pricesLabel: "দাম",
      modelsLabel: "মডেল",
      brandsLabel: "ব্র্যান্ড",
      skipToList: "সরাসরি পুরো তালিকা দেখুন",
      emptyHint: "একটা শর্ত একটু আলগা করে দেখুন — অথবা আমাদের লিখুন, সাধারণত কিছু একটা বের করা যায়।",
      seeEvery: "সব মেশিন দেখুন",
      pageOf: "{pages} পাতার {page} নম্বর",
      deviceCount: "টি মেশিন",
      sortLowToHigh: "কম দাম আগে",
      sortHighToLow: "বেশি দাম আগে",
      sortBest: "বেশি বিক্রি",
      sortLatest: "নতুন",
      lossSuffix: " শ্রবণক্ষয়ের জন্য",
    },

    picker: {
      heading: "কোনটা আপনার জন্য?",
      clear: "সব শর্ত বাদ দিন",
      lede: "যা যা মিলিয়ে নিতে চান বেছে নিন — নিচের তালিকা সেই অনুযায়ী ছোট হয়ে আসবে। চূড়ান্ত সিদ্ধান্ত অডিওগ্রামের পর।",
      lossLabel: "কতটা কম শুনছেন?",
      lossHint: "নিশ্চিত না হলে আন্দাজে বেছে নিন।",
      batteryLabel: "ছোট ব্যাটারি বদলাতে অসুবিধা হয়?",
      wantRechargeable: "হ্যাঁ, রিচার্জেবল চাই",
      batteryFine: "না, ব্যাটারি চলবে",
      budgetLabel: "বাজেট",
      // One budget per line: the number, then the label in this language.
      budgets: "50000 | ৫০ হাজারের মধ্যে\n120000 | ১ লাখ ২০ হাজারের মধ্যে",
      visibilityLabel: "দেখতে",
      preferHidden: "বাইরে থেকে দেখা না গেলে ভালো",
    },

    pager: {
      label: "পাতা",
      previous: "আগের",
      next: "পরের",
    },

    gallery: {
      heading: "ছবি ও ভিডিও",
      count: "{n} টি",
    },

    related: {
      heading: "পাশাপাশি দেখে নিন",
      lede: "দামে ও ক্ষমতায় এর কাছাকাছি মডেলগুলো। কোনটা আপনার লাগবে, সেটা অডিওগ্রাম দেখে ঠিক হবে।",
    },

    visit: {
      heading: "কোথায় আসবেন",
      hours: "শনি – বৃহস্পতি, সকাল ১০টা – রাত ৮টা। শুক্রবার ও সরকারি ছুটিতে বন্ধ।",
      waitNote: "সিরিয়াল নিয়ে এলে ভালো — সিরিয়াল ছাড়া গড়ে ২ ঘণ্টা পর্যন্ত অপেক্ষা করতে হতে পারে। ঢাকার বাইরে থেকে এলে সকাল ১০টার মধ্যে পৌঁছালে এক দিনেই সব শেষ হয়ে যায় (৩–৪ ঘণ্টা)।",
      messengerNote: "ফেসবুকেও মেসেজ করতে পারেন — দিনের বেশিরভাগ সময় আমরা সেখানেই থাকি।",
    },

    social: {
      heading: "আমাদের সাথে থাকুন",
      facebookNote: "প্রতিদিনের খবর ও মেসেঞ্জার",
      youtubeNote: "ভিডিও",
      privacy: "গোপনীয়তা ও তথ্য",
    },

    /**
     * What Google and WhatsApp show. Not decoration: the title is the line a
     * person decides on before they have seen the page, and it lived in six
     * different page files where nobody at the clinic could reach it.
     *
     * {n}, {name}, {price} and {page} are filled at render.
     */
    seo: {
      defaultTitle: "কানের মেশিনের দাম ও কান পরীক্ষা — সেনসো হিয়ারিং সেন্টার, পান্থপথ",
      defaultDescription: "পান্থপথ, ঢাকা। ReSound-এর অনুমোদিত ডিলার। কানের মেশিনের দাম খোলাখুলি লেখা, কান পরীক্ষার রিপোর্ট ৩৫ মিনিটে।",
      ogTitle: "কানের মেশিনের দাম ও কান পরীক্ষা — সেনসো হিয়ারিং সেন্টার",
      ogDescription: "দাম খোলাখুলি লেখা। কান পরীক্ষায় ৩৫ মিনিট, রিপোর্ট একই দিনে। ReSound-এর অনুমোদিত ডিলার।",
      ogImageAlt: "Senso Hearing Centre, Panthapath — ২০০৭ সাল থেকে ২০ হাজার রোগীর সেবায়",
      homeTitle: "কানের মেশিনের দাম ও কান পরীক্ষা — সেনসো হিয়ারিং সেন্টার, পান্থপথ",
      homeDescription: "পান্থপথ, ঢাকা। ReSound-এর অনুমোদিত ডিলার। প্রতিটি মেশিনের দাম ওয়েবসাইটেই লেখা। পূর্ণ কান পরীক্ষা ৩৫ মিনিটে, রিপোর্ট একই দিনে।",
      aboutTitle: "আমরা কারা — সেনসো হিয়ারিং সেন্টার, পান্থপথ",
      aboutDescription: "পান্থপথে ২০০৭ সাল থেকে। ReSound-এর অনুমোদিত ডিলার। অডিওলজিস্ট কে কখন বসেন, কী কী করা হয়, আর কী করা হয় না।",
      aboutOgTitle: "আমরা কারা — সেনসো হিয়ারিং সেন্টার",
      privacyTitle: "গোপনীয়তা ও তথ্য — সেনসো হিয়ারিং সেন্টার",
      privacyDescription: "আমরা কী কী তথ্য নিই, কেন নিই, কোথায় রাখি, কতদিন রাখি, আর আপনি না চাইলে কী করবেন।",
      listTitle: "{name} — সেনসো হিয়ারিং সেন্টার",
      listName: "কানের মেশিনের দাম",
      listPageSuffix: " — পাতা {page}",
      listDescription: "ReSound কানের মেশিনের পূর্ণ তালিকা ও দাম। কোনটি আপনার লাগবে তা কান পরীক্ষার পর নির্ধারিত হয়। সেনসো হিয়ারিং সেন্টার, পান্থপথ, ঢাকা।",
      partsDescription: "ReSound মেশিনের ব্যাটারি, ডোম, রিসিভার ও যন্ত্রাংশ। সেনসো হিয়ারিং সেন্টার, পান্থপথ, ঢাকা।",
      productDescription: "{name}. ReSound কানের মেশিন, দাম {price}। সেনসো হিয়ারিং সেন্টার, পান্থপথ, ঢাকা।",
    },

    /**
     * The questions a product page answers about itself, generated from the
     * device's own attributes. {name}, {from}, {to}, {price}, {months},
     * {years} and {tier} are filled from the device and the clinic record.
     *
     * A hundred and nine pages carrying identical boilerplate would be thin
     * and near-duplicate, which is worse than having no pages — so these are
     * written to differ by form factor, power class and battery type.
     */
    deviceFaq: {
      whoFor: "{name} কাদের জন্য?",
      whoForAnswer: "{from} থেকে {to} মাত্রার শ্রবণক্ষয়ের জন্য। {tier} চূড়ান্ত সিদ্ধান্ত অডিওগ্রামের পর — কানের অবস্থা না দেখে কোনো মেশিন সাজেস্ট করা ঠিক নয়।",
      priceQ: "{name}-এর দাম কত, আর দামের সাথে কী কী থাকে?",
      priceAnswer: "{price}। এর সাথে থাকে অডিওলজিস্টের সময়, মেশিন সেট করা ও যাচাই, ইয়ার মোল্ড, {months} মাস পর পর ফলো-আপ ও টিউনিং, এবং {years} বছরের ওয়ারেন্টি। পূর্ণ কান পরীক্ষার ফি আলাদা — {testFee}।",
      fitQ: "এটা কানে কীভাবে বসে? বাইরে থেকে দেখা যাবে?",
      batteryQ: "ব্যাটারি না রিচার্জ?",
      rechargeableAnswer: "এটি রিচার্জেবল — সাথে চার্জার থাকে, রাতে বসিয়ে রাখলে সারাদিন চলে। ছোট ব্যাটারি খোলা-লাগানোর ঝামেলা নেই, যা হাতে কাঁপুনি থাকলে বড় সুবিধা।",
      disposableAnswer: "এটি ব্যাটারিতে চলে। ব্যাটারি আমাদের এখানে পাওয়া যায় — {battery}।",
      powerQ: "এটা কি বেশি ক্ষমতার মেশিন?",
      powerAnswer: "হ্যাঁ। কম শোনার মাত্রা বেশি হলে সাধারণ মেশিনে যথেষ্ট শব্দ পৌঁছায় না — তখন এই ধরনের মেশিন লাগে। এগুলো একটু বড় হয়, তবে ধরতেও সুবিধা হয়।",
      tryQ: "কিনে ফেলার আগে শুনে দেখা যাবে?",
      tryAnswer: "যাবে। সেন্টারে এসে আপনার অডিওগ্রাম অনুযায়ী সেট করে কানে দিয়ে শুনতে পারবেন। তবে একবার বিক্রি হয়ে গেলে মেশিন ফেরত নেওয়া হয় না — তাই ওই বসাতেই ভালো করে শুনে, প্রশ্ন করে নিশ্চিত হয়ে নিন।",
      scaleNote: "এই মেশিনটি {from} থেকে {to} মাত্রার শ্রবণক্ষয়ের জন্য।",
    },

    /** The three doors under the hero: what a visitor came for. */
    doors: {
      aidsTitle: "কানের মেশিন",
      aidsNote: "{count}টি মডেল, প্রতিটির দাম লেখা",
      testsTitle: "কান পরীক্ষা",
      testsNote: "{minutes} মিনিটে রিপোর্ট, ফি {fee}",
      serviceTitle: "সার্ভিস",
      serviceNote: "নিজস্ব ল্যাবে, সাধারণত {days} দিনে",
    },

    /**
     * The words the catalogue uses about a device: how much loss it covers,
     * where it sits in the ear, what moving up the range actually buys.
     *
     * These were lookup tables in src/lib/catalogue.ts — the last prose on the
     * site that only a developer could change, and prose that appears on all
     * 109 product pages at once.
     */
    taxonomy: {
      loss_mild: "সামান্য",
      loss_moderate: "মাঝারি",
      loss_severe: "বেশি",
      loss_profound: "খুব বেশি",
      feels_mild: "শান্ত ঘরে কথা বুঝতে অসুবিধা হয় না, কিন্তু ভিড়ে বা দূর থেকে কথা ধরতে কষ্ট হয়।",
      feels_moderate: "টিভির শব্দ বাড়াতে হয়, আর বারবার “কী বললেন” জিজ্ঞেস করতে হয়।",
      feels_severe: "মুখোমুখি কথাও ঠিকমতো বোঝা যায় না, ফোনে কথা বলা কঠিন।",
      feels_profound: "জোরে বলা কথাও ধরা যায় না — বেশি ক্ষমতার মেশিন লাগে।",
      tier_entry: "শুরুর সারি",
      tier_mid: "মাঝারি সারি",
      tier_premium: "উপরের সারি",
      means_entry: "শান্ত জায়গায় ও এক-দুইজনের সাথে কথা বলার জন্য যথেষ্ট। ভিড়ের মধ্যে সীমাবদ্ধতা বেশি।",
      means_mid: "ভিড়ের মধ্যে কথা আলাদা করে ধরার ক্ষমতা ভালো। বেশিরভাগ মানুষের জন্য এটাই যথেষ্ট।",
      means_premium: "বাজার, বিয়েবাড়ি বা রেস্টুরেন্টের মতো কঠিন জায়গায় সবচেয়ে ভালো কাজ করে — যদিও কোনো মেশিনই সেখানে স্বাভাবিক কানের সমান নয়।",
      form_rie_short: "কানের পেছনে, ভেতরে স্পিকার",
      form_rie_long: "মূল অংশটা কানের পেছনে থাকে, আর যেটা শব্দ তৈরি করে সেটা সরু তার দিয়ে কানের ভেতরে বসে। সবচেয়ে বেশি মানুষ এটাই নেন — বাইরে থেকে প্রায় দেখা যায় না, আর শব্দ স্বাভাবিক লাগে।",
      form_bte_short: "কানের পেছনে, টিউব দিয়ে",
      form_bte_long: "পুরোটাই কানের পেছনে বসে, আর ইয়ার মোল্ডের সাথে টিউব দিয়ে যুক্ত থাকে। বেশি ক্ষমতা দিতে পারে, তাই কম শোনার মাত্রা বেশি হলে এটাই লাগে। হাতে ধরতেও সুবিধা।",
      form_cic_short: "কানের ভেতরে, দেখা যায় না",
      form_cic_long: "পুরো মেশিনটা কানের ভেতরে বসে যায়, বাইরে থেকে দেখা যায় না। তবে ছোট বলে ক্ষমতা কম, আর হাতে কাঁপুনি থাকলে খুলতে-পরতে অসুবিধা হতে পারে।",
      form_itc_short: "কানের ভেতরে",
      form_itc_long: "কানের ভেতরে বসে, CIC-এর চেয়ে একটু বড় — তাই ব্যাটারি বেশি চলে আর ধরতে সুবিধা।",
      form_iic_short: "কানের গভীরে, একেবারেই দেখা যায় না",
      form_iic_long: "CIC-এর চেয়েও ভেতরে বসে — বাইরে থেকে একেবারেই চোখে পড়ে না। সবচেয়ে ছোট বলে ক্ষমতাও সবচেয়ে কম, আর প্রতিটি কানের ছাঁচ অনুযায়ী আলাদা করে বানাতে হয়।",
      form_ite_short: "কানের ভেতরে, পূর্ণ",
      form_ite_long: "কানের বাইরের অংশ জুড়ে বসে। ধরতে সবচেয়ে সুবিধা, আর ব্যাটারিও বেশি চলে।",
      // "{from} থেকে {to}" — how two degrees of loss are joined into a range.
      lossRange: "{from} থেকে {to}",
    },

    notFound: {
      title: "এই পাতাটা নেই",
      lede: "লিংকটা পুরনো হতে পারে, অথবা ঠিকানায় ছোট একটা ভুল। নিচের যেকোনোটা দিয়ে শুরু করুন — অথবা হোয়াটসঅ্যাপে লিখুন, আমরা খুঁজে দিচ্ছি।",
      home: "হোমে ফিরে যান",
      alt: "সেনসো হিয়ারিং সেন্টার — পাতাটি পাওয়া যায়নি",
    },

    band: {
      testToReport: "পরীক্ষা থেকে রিপোর্ট",
      warranty: "ওয়ারেন্টি",
      betweenFollowUps: "পর পর ফলো-আপ",
      since: "সাল থেকে পান্থপথে",
      unitMin: "মিনিট",
      unitYears: "বছর",
      unitMonths: "মাসে",
    },

    footer: {
      hours: "সময়সূচি",
      hoursValue: "শনি – বৃহস্পতি: সকাল ১০টা – রাত ৮টা",
      closedFriday: "শুক্রবার বন্ধ",
      address: "ঠিকানা",
      contact: "যোগাযোগ",
      distributor:
        "ReSound (GN, ডেনমার্ক)-এর অনুমোদিত ডিলার। পান্থপথে ২০০৭ সাল থেকে।",
    },

    common: {
      langLabel: "English",
      map: "ম্যাপে দেখুন",
      verify: "ReSound-এর নিজের তালিকায় দেখুন",
    },

    wa: {
      appointment: "আসসালামু আলাইকুম। কান পরীক্ষার জন্য সিরিয়াল নিতে চাই।",
      prescription:
        "প্রেসক্রিপশনের ছবি পাঠাচ্ছি। কোন টেস্ট লাগবে জানাবেন।",
      parts: "মেশিনের ছবি পাঠাচ্ছি। কোন যন্ত্রাংশ লাগবে জানাবেন।",
      product: "{name} — এই মেশিনটি নিয়ে জানতে চাই।",
      general: "আসসালামু আলাইকুম।",
    },
  },

  en: {
    nav: {
      home: "Home",
      products: "Hearing aids",
      tests: "Hearing tests",
      service: "Service",
      accessories: "Accessories",
      gallery: "Gallery",
      sections: "Menu",
      about: "About us",
      visit: "Find us",
      call: "Call us",
      whatsapp: "WhatsApp",
    },

    hero: {
      eyebrow:
        "Panthapath, Dhaka · Authorised ReSound dealer in Bangladesh",
      title: "Not hearing well?",
      lede: "Start with a hearing test. {minutes} minutes, and the report is in your hand. Whether to buy anything comes after that.",
      phoneShort: "If the phone is hard, write instead — it is for most of our patients.",
      deviceAlt: "A ReSound OMNIA 461 hearing aid — the body sits behind the ear, the speaker inside the canal on a thin wire",
      deviceCaption: "ReSound OMNIA 461 · ",
      everyModel: "every model and price",
      ctaWhatsapp: "Message us on WhatsApp",
      ctaCall: "Call us",
      phoneNoteTitle: "Find phone calls difficult?",
      phoneNote:
        "Write to us instead. Most of our patients struggle on the phone — that is usually why they come to us in the first place. WhatsApp, Messenger, or simply walk in.",
      openNow: "Open now",
      closedNow: "Closed now",
      openUntil: "Open until {hour}",
      opensAt: "Opens {day} at {hour}",
      tomorrow: "tomorrow",
      hoursFallback: "Saturday – Thursday, 10 AM – 8 PM · Closed Friday",
    },

    products: {
      heading: "Which device, what price",
      lede: "The greater the hearing loss, the more powerful the device has to be — which is where the spread in price comes from. Which one you need is settled after the audiogram.",
      all: "See all hearing aids",
      from: "from",
      series: "Series",
      brand: "Brand",
      price: "Price",
      details: "Details",
      askPrice: "Ask about this device",
      empty: "No devices in this series yet.",
      sortBy: "Sort by",
      filterSeries: "Series",
      allSeries: "All",
    },

    faq: { heading: "A few more questions" },

    tests: {
      heading: "Test fees and how long they take",
      lede:
        "You do not need a prescription — the audiologist will tell you which test you need.",
      allThree: "All three together",
      minutes: "{n} min",
      reportNote:
        "Report within minutes. For ages {age} and up — there is a separate arrangement for younger children.",
      prescriptionCta: "Show your prescription",
      serviceLead: "Service and parts —",
      serviceNote:
        "We service {brand} devices even if bought abroad, usually within {days} day in our own lab. Parts can be couriered.",
    },

    trust: {
      heading: "An authorised {brand} dealer",
      lede:
        "{brand} names us as their Bangladesh dealer on their own website — the link below goes straight to it.",
      about: "About us",
      verify: "See {brand}'s listing",
      sinceLabel: "In Panthapath",
      sinceValue: "Since {year}",
      warrantyLabel: "Warranty",
      warrantyValue: "{years} years, follow-up every {months} months",
      hospitalsLabel: "We work with",
      whoSits: "Who sits when",
    },

    strip: {
      devices: "Devices",
      devicesNote: "from",
      fullTest: "Full test",
      openNow: "Open now",
      closedNow: "Closed",
      openNote: "till · closed Fri",
      tomorrow: "tomorrow",
      daysFallback: "Sat – Thu",
    },

    about: {
      eyebrow: "About us",
      title: "We test, we fit, and then we stay with you.",
      lede: "In Panthapath since {year}. Selling a hearing aid is only part of what happens here — the rest is choosing the right one, setting it properly, and keeping it right for years afterwards.",
      yearsUnit: "years",
      sinceLabel: "since {year}",
      dealerLabel: "authorised dealer",
      hospitalsLabel: "hospitals we work with",
      warrantyLabel: "warranty",
      stepsHeading: "What happens here",
      steps:
        "The test — PTA, tympanometry and speech — the report in your hand in {minutes} minutes.\nChoosing the device — The audiogram decides how much power you need. You wear one and hear the difference before deciding.\nThe ear mould — Cast from your own ear in our lab. Even a good device will not work if it does not seat properly.\nFitting and verification — We measure how much sound actually reaches the eardrum and set it from that — not from what the box claims.\nAnd afterwards — Follow-up and re-tuning every {months} months. Service, batteries and parts, all here.",
      peopleHeading: "The people you will meet",
      peopleLede: "If you want to see a particular person, say so on WhatsApp when you book.",
      verifyHeading: "Check it for yourself",
      verifyLede:
        "{brand} names us as their Bangladesh dealer on their own website. That is not something you can check about most hearing centres in Dhaka.",
      awardCaption: "Business Excellence Award, 2019",
      limitsHeading: "What we do not do",
      limitsLede: "Knowing this before you come saves everyone's time.",
      limits:
        "We are a {brand} dealer only — we do not sell or service Signia, Phonak or Oticon.\nThere is no instalment or EMI facility. Cards, bKash and Bangla QR are accepted.\nOnce a device is sold it is not taken back — so hear it, ask your questions, and be sure first.\nWe have no branches outside Dhaka. There are dealer points, and parts can be couriered.",
      whereHeading: "Where to find us",
      naatiCta: "Talk to Naati",
    },

    privacy: {
      title: "Privacy",
      intro: "What we collect, why, where it goes, how long we keep it, and what to do if you would rather we did not. Written plainly on purpose.",
      updated: "Last updated: September 2026",
      // The whole notice in one field, so it can be read and edited as the
      // document it is rather than as thirty disconnected rows. A line that
      // begins "## " opens a section; every other line is a paragraph.
      body: "## What we collect\nWhatever you write in the chat — your question, your description of the problem.\nPhotographs of a prescription, a report or a device, if you send one.\nTo book: your name and phone number. If the patient is under 18, the guardian's name as well.\nNothing else. No email address, no home address, no ID number.\n## Why\nTo answer you, and to book your appointment. That is all.\nNot for advertising. We do not sell it and we do not share it.\n## Where it goes\nYour name, number and appointment go into Senso's own system, seen only by our staff.\nTo read your messages and photographs we use a service from Google, whose servers are outside Bangladesh. The image is read, you get an answer, and we keep no copy of it.\nA prescription usually carries a name, an age and a diagnosis, so this is worth knowing before you send one — and if you would rather not, type it out instead and we will help you just the same.\n## How long we keep it\nPhotographs are never stored. They are read, answered, and gone.\nThe conversation stays in your own browser while the tab is open. We do not store chats on our servers.\nWhatever you told us about your symptoms when booking is deleted after 180 days. The appointment itself stays, because it is part of the clinic's records.\nAn appointment that was never confirmed, for a day that has passed, is deleted after 90 days.\nIf you are a patient here, your clinical and billing records are kept as the accounting rules require. That is separate from this website.\n## Children\nAn appointment for anyone under 18 is made by their parent or guardian, and we record that person's name.\nWe do not ask for a child's date of birth.\n## If you would rather not\nYou can ask everything by typing, without sending a photograph.\nAsk us to delete your details and we will. A phone call or an email is enough.\nAsk what we hold about you and we will show you.\n## What we do not do\nThere is no tracker on this site following you around the internet.\nYour details are not used to show you advertising.\nNaati is not a doctor. It does not diagnose and it does not discuss medication.",
      contactHeading: "Who to ask",
      contactLede: "For anything about your data, including deleting it, contact Senso Hearing Centre:",
      back: "← Back to the site",
    },

    catalogue: {
      partsTitle: "Batteries and parts",
      partsLede: "Batteries, domes, receivers, wax guards. Send us a photo of the device and we will tell you which part it takes.",
      pricesLabel: "Prices",
      modelsLabel: "Models",
      brandsLabel: "Brands",
      skipToList: "Skip to the full list",
      emptyHint: "Try loosening one answer — or write to us, there is usually a way round it.",
      seeEvery: "See every device",
      pageOf: "Page {page} of {pages}",
      deviceCount: "devices",
      sortLowToHigh: "Price: low to high",
      sortHighToLow: "Price: high to low",
      sortBest: "Best selling",
      sortLatest: "Latest",
      lossSuffix: " loss",
    },

    picker: {
      heading: "Which one suits you?",
      clear: "Clear all",
      lede: "Pick what matters and the list below narrows to match. The final choice is settled after the audiogram.",
      lossLabel: "How much hearing is gone?",
      lossHint: "Guess if you are not sure.",
      batteryLabel: "Is changing a tiny battery a problem?",
      wantRechargeable: "Rechargeable",
      batteryFine: "Battery is fine",
      budgetLabel: "Budget",
      budgets: "50000 | Under \u09f3 50,000\n120000 | Under \u09f3 120,000",
      visibilityLabel: "Visibility",
      preferHidden: "Prefer it hidden",
    },

    pager: {
      label: "Pagination",
      previous: "Previous",
      next: "Next",
    },

    gallery: {
      heading: "Photos and video",
      count: "{n}",
    },

    related: {
      heading: "Worth comparing",
      lede: "The models closest to this one in price and capability. Which one you need is settled by the audiogram.",
    },

    visit: {
      heading: "Finding us",
      hours: "Saturday – Thursday, 10 AM – 8 PM. Closed Friday and government holidays.",
      waitNote: "Book ahead if you can — without an appointment the wait averages up to two hours. Coming from outside Dhaka, arrive by 10 AM and it can all be done in one day (three to four hours).",
      messengerNote: "You can message us on Facebook too — that is where we are most of the day.",
    },

    social: {
      heading: "Find us online",
      facebookNote: "Daily posts and Messenger",
      youtubeNote: "Video",
      privacy: "Privacy",
    },

    seo: {
      defaultTitle: "Hearing aid prices and hearing tests — Senso Hearing Centre, Panthapath",
      defaultDescription: "Panthapath, Dhaka. An authorised ReSound dealer. Every device's price is published, and a full hearing test takes 35 minutes.",
      ogTitle: "Hearing aid prices and hearing tests — Senso Hearing Centre",
      ogDescription: "Prices published. A full hearing test in 35 minutes, report the same day. An authorised ReSound dealer.",
      ogImageAlt: "Senso Hearing Centre, Panthapath — serving 20,000 patients since 2007",
      homeTitle: "Hearing aid prices and hearing tests — Senso Hearing Centre, Panthapath",
      homeDescription: "Panthapath, Dhaka. An authorised ReSound dealer. Every device's price is on the site. A full hearing assessment takes 35 minutes and the report is the same day.",
      aboutTitle: "About us — Senso Hearing Centre, Panthapath",
      aboutDescription: "In Panthapath since 2007. An authorised ReSound dealer. Who sits when, what happens here, and what we do not do.",
      aboutOgTitle: "About us — Senso Hearing Centre",
      privacyTitle: "Privacy — Senso Hearing Centre",
      privacyDescription: "What we collect, why, where it goes, how long we keep it, and what to do if you would rather we did not.",
      listTitle: "{name} — Senso Hearing Centre",
      listName: "Hearing aid prices",
      listPageSuffix: " — page {page}",
      listDescription: "The full ReSound hearing aid range with prices. Which one you need is settled after the hearing test. Senso Hearing Centre, Panthapath, Dhaka.",
      partsDescription: "Batteries, domes, receivers and parts for ReSound devices. Senso Hearing Centre, Panthapath, Dhaka.",
      productDescription: "{name}. A ReSound hearing aid, {price}. Senso Hearing Centre, Panthapath, Dhaka.",
    },

    deviceFaq: {
      whoFor: "Who is the {name} for?",
      whoForAnswer: "For {from} to {to} hearing loss. {tier} The final choice is settled after the audiogram — recommending a device without seeing the ear is not something we do.",
      priceQ: "What does the {name} cost, and what is included?",
      priceAnswer: "{price}. That covers the audiologist's time, programming and verification, the ear mould, follow-up and re-tuning every {months} months, and a {years}-year warranty. The full hearing assessment is separate at {testFee}.",
      fitQ: "How does it sit in the ear, and will people see it?",
      batteryQ: "Battery or rechargeable?",
      rechargeableAnswer: "This one is rechargeable — the charger comes with it, and a night on the dock lasts the day. No fiddling with tiny cells, which matters a great deal if your hands are unsteady.",
      disposableAnswer: "This one takes disposable batteries. We stock them — {battery}.",
      powerQ: "Is this one of the more powerful devices?",
      powerAnswer: "Yes. When the loss is deeper, an ordinary device cannot deliver enough sound without whistling. These are a little larger — which also makes them easier to handle.",
      tryQ: "Can I hear it before buying?",
      tryAnswer: "Yes. We programme it to your audiogram and you wear it in the centre. Do note that once sold a device is not taken back, so take your time in that sitting and ask everything you want to ask.",
      scaleNote: "Fitted for {from} to {to} hearing loss.",
    },

    doors: {
      aidsTitle: "Hearing aids",
      aidsNote: "{count} models, every price published",
      testsTitle: "Hearing tests",
      testsNote: "The report in {minutes} minutes, {fee}",
      serviceTitle: "Service",
      serviceNote: "In our own lab, usually within {days} day",
    },

    /**
     * The words the catalogue uses about a device: how much loss it covers,
     * where it sits in the ear, what moving up the range actually buys.
     *
     * These were lookup tables in src/lib/catalogue.ts — the last prose on the
     * site that only a developer could change, and prose that appears on all
     * 109 product pages at once.
     */
    taxonomy: {
      loss_mild: "mild",
      loss_moderate: "moderate",
      loss_severe: "severe",
      loss_profound: "profound",
      feels_mild: "Conversation is fine in a quiet room, but hard in a crowd or from across it.",
      feels_moderate: "The television goes up, and you find yourself asking people to repeat themselves.",
      feels_severe: "Even face-to-face talk is hard to follow, and the phone is difficult.",
      feels_profound: "Even raised voices do not come through — this needs the most powerful devices.",
      tier_entry: "Entry",
      tier_mid: "Mid range",
      tier_premium: "Premium",
      means_entry: "Enough for quiet rooms and one or two people. More limited once there is background noise.",
      means_mid: "Noticeably better at separating a voice from background noise. Enough for most people.",
      means_premium: "Handles the hardest rooms best — markets, weddings, restaurants — though no device matches a normal ear there.",
      form_rie_short: "Behind the ear, speaker inside",
      form_rie_long: "The body sits behind the ear and the speaker sits inside the canal on a thin wire. This is what most people end up with — it is barely visible and it sounds the most natural.",
      form_bte_short: "Behind the ear, with tubing",
      form_bte_long: "The whole device sits behind the ear and connects to an ear mould through tubing. It delivers the most power, so it is what more severe loss needs — and it is the easiest to handle.",
      form_cic_short: "In the canal, hidden",
      form_cic_long: "The device sits entirely inside the canal and cannot be seen. Being small it has less power, and it can be fiddly if your hands are unsteady.",
      form_itc_short: "In the canal",
      form_itc_long: "Sits in the canal, a little larger than a CIC — so the battery lasts longer and it is easier to handle.",
      form_iic_short: "Deep in the canal, invisible",
      form_iic_long: "Sits deeper than a CIC and cannot be seen at all. Being the smallest it also has the least power, and each one is built to a mould of your own ear.",
      form_ite_short: "In the ear, full shell",
      form_ite_long: "Fills the outer bowl of the ear. The easiest of the in-ear styles to handle, with the longest battery life.",
      // "{from} থেকে {to}" — how two degrees of loss are joined into a range.
      lossRange: "{from} to {to}",
    },

    notFound: {
      title: "This page is not here",
      lede: "The link may be an old one, or there may be a small mistake in the address. Start from any of these — or write to us on WhatsApp and we will find it for you.",
      home: "Back to the home page",
      alt: "Senso Hearing Centre — page not found",
    },

    band: {
      testToReport: "test to report",
      warranty: "warranty",
      betweenFollowUps: "between follow-ups",
      since: "in Panthapath since",
      unitMin: "min",
      unitYears: "years",
      unitMonths: "months",
    },

    footer: {
      hours: "Opening hours",
      hoursValue: "Saturday – Thursday: 10 AM – 8 PM",
      closedFriday: "Closed on Friday",
      address: "Address",
      contact: "Contact",
      distributor:
        "Authorised ReSound (GN, Denmark) dealer in Bangladesh. In Panthapath since 2007.",
    },

    common: {
      langLabel: "বাংলা",
      map: "Open in Maps",
      verify: "See us on ReSound's own listing",
    },

    wa: {
      appointment: "Hello. I would like to book a hearing test.",
      prescription:
        "I am sending a photo of my prescription. Please tell me which tests I need.",
      parts:
        "I am sending a photo of my device. Please tell me which part I need.",
      product: "I would like to know more about {name}.",
      general: "Hello.",
    },
  },
} as const;

export function dict(lang: Lang) {
  return t[lang] ?? t[DEFAULT_LANG];
}

/**
 * Puts values into a sentence that has {placeholders} in it.
 *
 * The alternative was a function per sentence, which is what the dictionary
 * did before — and a function cannot be replaced by a row from the CMS, so
 * every sentence that mentioned a price or a year was a sentence Senso could
 * not edit. A placeholder is a string all the way down.
 *
 * A token with nothing to fill it is left as it is rather than blanked: a
 * visible "{years}" on the page is a bug somebody reports, and a sentence
 * missing its number silently is a bug nobody notices.
 */
/** A newline-separated list, as the CMS stores one, with blank lines dropped. */
export function lines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * One line of a list that carries a title and a sentence, split on the first
 * em dash. A line without one is all sentence and no title, which is what
 * somebody who typed a plain list meant.
 */
export function titled(line: string): { title: string; body: string } {
  const at = line.indexOf(" — ");
  if (at === -1) return { title: "", body: line };
  return { title: line.slice(0, at).trim(), body: line.slice(at + 3).trim() };
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in values ? String(values[key]) : whole
  );
}

/** Bangla has no AM/PM — the day-period word carries the meaning. */
export function clockLabel(hour: number, lang: Lang) {
  const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  if (lang === "en") return `${display} ${hour < 12 ? "AM" : "PM"}`;
  const part =
    hour < 6
      ? "রাত"
      : hour < 12
      ? "সকাল"
      : hour < 16
      ? "দুপুর"
      : hour < 18
      ? "বিকেল"
      : hour < 19
      ? "সন্ধ্যা"
      : "রাত";
  const BN = "০১২৩৪৫৬৭৮৯";
  const bn = String(display).replace(/\d/g, (d) => BN[+d]);
  return `${part} ${bn}টা`;
}

export const DAY_NAMES = {
  bn: ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
} as const;
