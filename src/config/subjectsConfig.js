/**
 * ЕДИНЫЙ КОНФИГУРАЦИОННЫЙ РЕЕСТР ПРЕДМЕТОВ И ПРОФИЛЕЙ ЕНТ
 * Позволяет добавлять новые предметы и комбинации декларативно без изменения бизнес-логики.
 */

export const SUBJECTS_CONFIG = {
  // Обязательные предметы (Mandatory)
  mandatory: [
    {
      id: "history_kz",
      code: "HIST_KZ",
      name: {
        ru: "История Казахстана",
        kk: "Қазақстан тарихы"
      },
      shortName: {
        ru: "История КЗ",
        kk: "Қаз. тарихы"
      },
      questionCount: 20,
      pointsPerQuestion: 1,
      durationMinutes: 35,
      color: "blue",
      topics: [
        { id: "ancient_kazakhstan", name: { ru: "Древний Казахстан", kk: "Ежелгі Қазақстан" } },
        { id: "kazakh_khanate", name: { ru: "Казахское ханство (XV–XVIII вв.)", kk: "Қазақ хандығы (XV–XVIII ғғ.)" } },
        { id: "colonial_period", name: { ru: "Казахстан в составе Российской империи", kk: "Қазақстан Ресей империясы құрамында" } },
        { id: "soviet_period", name: { ru: "Казахстан в советский период", kk: "Кеңестік кезеңдегі Қазақстан" } },
        { id: "independent_kz", name: { ru: "Независимый Казахстан (1991–н.в.)", kk: "Тәуелсіз Қазақстан (1991–қ.у.)" } }
      ]
    },
    {
      id: "reading_literacy",
      code: "READ_LIT",
      name: {
        ru: "Грамотность чтения",
        kk: "Оқу сауаттылығы"
      },
      shortName: {
        ru: "Чтение",
        kk: "Оқу сауат."
      },
      questionCount: 10,
      pointsPerQuestion: 1,
      durationMinutes: 20,
      color: "emerald",
      topics: [
        { id: "text_analysis", name: { ru: "Анализ и синтез текста", kk: "Мәтінді талдау және синтез" } },
        { id: "main_idea", name: { ru: "Определение главной мысли", kk: "Негізгі ойды анықтау" } },
        { id: "context_deduction", name: { ru: "Контекстный вывод и выводы", kk: "Мәтінмәндік қорытынды" } }
      ]
    },
    {
      id: "math_literacy",
      code: "MATH_LIT",
      name: {
        ru: "Математическая грамотность",
        kk: "Математикалық сауаттылық"
      },
      shortName: {
        ru: "Мат. грамотность",
        kk: "Мат. сауат."
      },
      questionCount: 10,
      pointsPerQuestion: 1,
      durationMinutes: 20,
      color: "amber",
      topics: [
        { id: "logic_sequences", name: { ru: "Логические закономерности", kk: "Логикалық заңдылықтар" } },
        { id: "percents_proportions", name: { ru: "Проценты и пропорции", kk: "Пайыздар мен пропорциялар" } },
        { id: "applied_geometry", name: { ru: "Прикладная геометрия", kk: "Қолданбалы геометрия" } },
        { id: "combinatorics_prob", name: { ru: "Комбинаторика и вероятность", kk: "Комбинаторика және ықтималдық" } }
      ]
    }
  ],

  // Профильные комбинации (Profile Combinations)
  profileCombinations: [
    {
      id: "math_physics",
      name: {
        ru: "Математика + Физика",
        kk: "Математика + Физика"
      },
      description: {
        ru: "Инженерия, IT, архитектура, энергетика, авиастроение",
        kk: "Инженерия, IT, архитектура, энергетика, авиация"
      },
      subjects: [
        {
          id: "math_advanced",
          name: { ru: "Математика", kk: "Математика" },
          questionCount: 35,
          topics: [
            { id: "algebra_equations", name: { ru: "Алгебра и уравнения", kk: "Алгебра және теңдеулер" } },
            { id: "trigonometry", name: { ru: "Тригонометрия", kk: "Тригонометрия" } },
            { id: "calculus", name: { ru: "Начала анализа (производная, интеграл)", kk: "Анализ бастамалары (туынды, интеграл)" } },
            { id: "planimetry_stereometry", name: { ru: "Геометрия и стереометрия", kk: "Геометрия және стереометрия" } }
          ]
        },
        {
          id: "physics",
          name: { ru: "Физика", kk: "Физика" },
          questionCount: 35,
          topics: [
            { id: "kinematics_dynamics", name: { ru: "Механика и динамика", kk: "Механика және динамика" } },
            { id: "thermodynamics", name: { ru: "Молекулярная физика и термодинамика", kk: "Молекулалық физика және термодинамика" } },
            { id: "electromagnetism", name: { ru: "Электромагнетизм", kk: "Электромагнетизм" } },
            { id: "optics_quantum", name: { ru: "Оптика и квантовая физика", kk: "Оптика және кванттық физика" } }
          ]
        }
      ]
    },
    {
      id: "bio_chemistry",
      name: {
        ru: "Биология + Химия",
        kk: "Биология + Химия"
      },
      description: {
        ru: "Медицина, фармацевтика, биотехнологии, экология",
        kk: "Медицина, фармацевтика, биотехнология, экология"
      },
      subjects: [
        {
          id: "biology",
          name: { ru: "Биология", kk: "Биология" },
          questionCount: 35,
          topics: [
            { id: "cell_biology", name: { ru: "Цитология и молекулярная биология", kk: "Цитология және молекулалық биология" } },
            { id: "human_anatomy", name: { ru: "Анатомия и физиология человека", kk: "Адам анатомиясы мен физиологиясы" } },
            { id: "genetics_evolution", name: { ru: "Генетика и эволюция", kk: "Генетика және эволюция" } }
          ]
        },
        {
          id: "chemistry",
          name: { ru: "Химия", kk: "Химия" },
          questionCount: 35,
          topics: [
            { id: "inorganic_chemistry", name: { ru: "Неорганическая химия", kk: "Бейорганикалық химия" } },
            { id: "organic_chemistry", name: { ru: "Органическая химия", kk: "Органикалық химия" } },
            { id: "chemical_kinetics", name: { ru: "Химическая кинетика и термодинамика", kk: "Химиялық кинетика және термодинамика" } }
          ]
        }
      ]
    },
    {
      id: "geography_worldhistory",
      name: {
        ru: "География + Всемирная история",
        kk: "География + Дүниежүзі тарихы"
      },
      description: {
        ru: "Международные отношения, регионоведение, туризм",
        kk: "Халықаралық қатынастар, аймақтану, туризм"
      },
      subjects: [
        {
          id: "geography",
          name: { ru: "География", kk: "География" },
          questionCount: 35,
          topics: [
            { id: "physical_geography", name: { ru: "Физическая география", kk: "Физикалық география" } },
            { id: "social_economic_geo", name: { ru: "Социально-экономическая география", kk: "Әлеуметтік-экономикалық география" } }
          ]
        },
        {
          id: "world_history",
          name: { ru: "Всемирная история", kk: "Дүниежүзі тарихы" },
          questionCount: 35,
          topics: [
            { id: "ancient_world", name: { ru: "Древний мир и Средние века", kk: "Ежелгі дүние және Орта ғасырлар" } },
            { id: "modern_history", name: { ru: "Новая и новейшая история", kk: "Жаңа және қазіргі заман тарихы" } }
          ]
        }
      ]
    },
    {
      id: "foreign_worldhistory",
      name: {
        ru: "Иностранный язык + Всемирная история",
        kk: "Шетел тілі + Дүниежүзі тарихы"
      },
      description: {
        ru: "Переводческое дело, лингвистика, дипломатия",
        kk: "Аударма ісі, лингвистика, дипломатия"
      },
      subjects: [
        {
          id: "foreign_language",
          name: { ru: "Иностранный язык (Английский)", kk: "Шетел тілі (Ағылшын)" },
          questionCount: 35,
          topics: [
            { id: "grammar_vocabulary", name: { ru: "Грамматика и лексика", kk: "Грамматика және лексика" } },
            { id: "reading_comprehension", name: { ru: "Чтение и понимание", kk: "Мәтінді түсіну" } }
          ]
        },
        {
          id: "world_history",
          name: { ru: "Всемирная история", kk: "Дүниежүзі тарихы" },
          questionCount: 35,
          topics: [
            { id: "ancient_world", name: { ru: "Древний мир и Средние века", kk: "Ежелгі дүние және Орта ғасырлар" } }
          ]
        }
      ]
    },
    {
      id: "kazlang_kazlit",
      name: {
        ru: "Казахский язык + Казахская литература",
        kk: "Қазақ тілі + Қазақ әдебиеті"
      },
      description: {
        ru: "Филология, педагогика, журналистика",
        kk: "Филология, педагогика, журналистика"
      },
      subjects: [
        {
          id: "kazakh_language",
          name: { ru: "Казахский язык", kk: "Қазақ тілі" },
          questionCount: 35,
          topics: [
            { id: "phonetics_morphology", name: { ru: "Фонетика мен морфология", kk: "Фонетика мен морфология" } },
            { id: "syntax_orthography", name: { ru: "Синтаксис пен емле", kk: "Синтаксис пен емле" } }
          ]
        },
        {
          id: "kazakh_literature",
          name: { ru: "Казахская литература", kk: "Қазақ әдебиеті" },
          questionCount: 35,
          topics: [
            { id: "folklore_epos", name: { ru: "Фольклор және батырлар жыры", kk: "Фольклор және батырлар жыры" } },
            { id: "classical_literature", name: { ru: "Классикалық әдебиет (Абай, Мағжан, Мұхтар)", kk: "Классикалық әдебиет" } }
          ]
        }
      ]
    }
  ]
};

// Функция-утилита для поиска предмета по ID
export function getSubjectById(subjectId) {
  const mandatory = SUBJECTS_CONFIG.mandatory.find(s => s.id === subjectId);
  if (mandatory) return mandatory;

  for (const combo of SUBJECTS_CONFIG.profileCombinations) {
    const found = combo.subjects.find(s => s.id === subjectId);
    if (found) return found;
  }
  return null;
}

// Функция-утилита для поиска темы по ID
export function getTopicById(subjectId, topicId) {
  const subject = getSubjectById(subjectId);
  if (!subject || !subject.topics) return null;
  return subject.topics.find(t => t.id === topicId) || null;
}
