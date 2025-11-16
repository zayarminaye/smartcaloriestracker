export type Language = 'mm' | 'en';

export interface Translations {
  // Common
  common: {
    appName: string;
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    filter: string;
    back: string;
    next: string;
    submit: string;
    confirm: string;
    yes: string;
    no: string;
    ok: string;
    close: string;
  };

  // Auth
  auth: {
    login: string;
    logout: string;
    register: string;
    email: string;
    password: string;
    confirmPassword: string;
    forgotPassword: string;
    resetPassword: string;
    signIn: string;
    signUp: string;
    signOut: string;
    fullName: string;
    displayName: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    emailRequired: string;
    passwordRequired: string;
    passwordMismatch: string;
    loginSuccess: string;
    loginError: string;
    registerSuccess: string;
    registerError: string;
  };

  // Dashboard
  dashboard: {
    title: string;
    todaysCalories: string;
    caloriesRemaining: string;
    breakfast: string;
    lunch: string;
    dinner: string;
    snack: string;
    totalCalories: string;
    protein: string;
    fat: string;
    carbs: string;
    fiber: string;
    streak: string;
    days: string;
    level: string;
    points: string;
  };

  // Meals
  meals: {
    addMeal: string;
    editMeal: string;
    deleteMeal: string;
    mealName: string;
    mealType: string;
    ingredients: string;
    portion: string;
    calories: string;
    searchIngredients: string;
    addIngredient: string;
    removeIngredient: string;
    saveMeal: string;
    aiExtract: string;
    describeYourMeal: string;
    extractingIngredients: string;
  };

  // Ingredients
  ingredients: {
    title: string;
    name: string;
    nameEnglish: string;
    nameMyanmar: string;
    category: string;
    calories: string;
    protein: string;
    fat: string;
    carbs: string;
    fiber: string;
    verified: string;
    unverified: string;
    aiGenerated: string;
    fromDatabase: string;
    verificationStatus: string;
    dataSource: string;
  };

  // Admin
  admin: {
    dashboard: string;
    users: string;
    ingredients: string;
    settings: string;
    languages: string;
    userManagement: string;
    ingredientManagement: string;
    systemSettings: string;
    languageEditor: string;
    verifyIngredient: string;
    unverifyIngredient: string;
    makeAdmin: string;
    removeAdmin: string;
    totalUsers: string;
    totalIngredients: string;
    pendingVerification: string;
    recentActivity: string;
  };
}

export const translations: Record<Language, Translations> = {
  mm: {
    common: {
      appName: 'စမတ်ကယ်လိုရီထရက်ကာ',
      loading: 'ခဏစောင့်ပါ...',
      save: 'သိမ်းမည်',
      cancel: 'မလုပ်တော့ဘူး',
      delete: 'ဖျက်မည်',
      edit: 'ပြင်မည်',
      add: 'ထည့်မည်',
      search: 'ရှာမည်',
      filter: 'စီစစ်မည်',
      back: 'နောက်သို့',
      next: 'ရှေ့သို့',
      submit: 'တင်သွင်းမည်',
      confirm: 'အတည်ပြုမည်',
      yes: 'ဟုတ်ကဲ့',
      no: 'မဟုတ်ဘူး',
      ok: 'ကောင်းပြီ',
      close: 'ပိတ်မည်',
    },
    auth: {
      login: 'ဝင်ရောက်ရန်',
      logout: 'ထွက်ရန်',
      register: 'စာရင်းသွင်းရန်',
      email: 'အီးမေးလ်',
      password: 'စကားဝှက်',
      confirmPassword: 'စကားဝှက် အတည်ပြုရန်',
      forgotPassword: 'စကားဝှက် မေ့နေသလား',
      resetPassword: 'စကားဝှက် ပြန်လည်သတ်မှတ်ရန်',
      signIn: 'ဝင်ရောက်မည်',
      signUp: 'အကောင့်ဖွင့်မည်',
      signOut: 'ထွက်မည်',
      fullName: 'အမည် အပြည့်အစုံ',
      displayName: 'ပြသမည့် အမည်',
      alreadyHaveAccount: 'အကောင့်ရှိပြီးသားလား? ',
      dontHaveAccount: 'အကောင့်မရှိသေးဘူးလား? ',
      emailRequired: 'အီးမေးလ် လိုအပ်ပါသည်',
      passwordRequired: 'စကားဝှက် လိုအပ်ပါသည်',
      passwordMismatch: 'စကားဝှက် မကိုက်ညီပါ',
      loginSuccess: 'အောင်မြင်စွာ ဝင်ရောက်ပြီးပါပြီ',
      loginError: 'ဝင်ရောက်ရာတွင် အမှားရှိနေပါသည်',
      registerSuccess: 'အောင်မြင်စွာ စာရင်းသွင်းပြီးပါပြီ',
      registerError: 'စာရင်းသွင်းရာတွင် အမှားရှိနေပါသည်',
    },
    dashboard: {
      title: 'ဒက်ရှ်ဘုတ်',
      todaysCalories: 'ယနေ့ ကယ်လိုရီ',
      caloriesRemaining: 'ကျန်ရှိသော ကယ်လိုရီ',
      breakfast: 'မနက်စာ',
      lunch: 'နေ့လည်စာ',
      dinner: 'ညစာ',
      snack: 'ဆလာ',
      totalCalories: 'စုစုပေါင်း ကယ်လိုရီ',
      protein: 'ပရိုတင်း',
      fat: 'အဆီ',
      carbs: 'ကာဗွန်ဟိုက်ဒရိတ်',
      fiber: 'အမျှင်',
      streak: 'ဆက်တိုက်',
      days: 'ရက်',
      level: 'အဆင့်',
      points: 'ရမှတ်',
    },
    meals: {
      addMeal: 'အစားအသောက် ထည့်မည်',
      editMeal: 'အစားအသောက် ပြင်မည်',
      deleteMeal: 'အစားအသောက် ဖျက်မည်',
      mealName: 'အစားအသောက် အမည်',
      mealType: 'အစားအသောက် အမျိုးအစား',
      ingredients: 'ပါဝင်ပစ္စည်းများ',
      portion: 'ပမာဏ',
      calories: 'ကယ်လိုရီ',
      searchIngredients: 'ပါဝင်ပစ္စည်းများ ရှာမည်',
      addIngredient: 'ပါဝင်ပစ္စည်း ထည့်မည်',
      removeIngredient: 'ပါဝင်ပစ္စည်း ဖယ်ရှားမည်',
      saveMeal: 'အစားအသောက် သိမ်းမည်',
      aiExtract: 'AI ဖြင့် ရှာဖွေမည်',
      describeYourMeal: 'သင့်အစားအသောက်ကို ဖော်ပြပါ',
      extractingIngredients: 'ပါဝင်ပစ္စည်းများ ထုတ်နေသည်...',
    },
    ingredients: {
      title: 'ပါဝင်ပစ္စည်းများ',
      name: 'အမည်',
      nameEnglish: 'အင်္ဂလိပ်အမည်',
      nameMyanmar: 'မြန်မာအမည်',
      category: 'အမျိုးအစား',
      calories: 'ကယ်လိုရီ',
      protein: 'ပရိုတင်း',
      fat: 'အဆီ',
      carbs: 'ကာဗွန်',
      fiber: 'အမျှင်',
      verified: 'အတည်ပြုပြီး',
      unverified: 'မအတည်ပြုရသေး',
      aiGenerated: 'AI ဖန်တီးထားသော',
      fromDatabase: 'ဒေတာဘေ့စ်မှ',
      verificationStatus: 'အတည်ပြုမှု အခြေအနေ',
      dataSource: 'ဒေတာ အရင်းအမြစ်',
    },
    admin: {
      dashboard: 'အက်ဒမင် ဒက်ရှ်ဘုတ်',
      users: 'အသုံးပြုသူများ',
      ingredients: 'ပါဝင်ပစ္စည်းများ',
      settings: 'ဆက်တင်များ',
      languages: 'ဘာသာစကားများ',
      userManagement: 'အသုံးပြုသူ စီမံခန့်ခွဲမှု',
      ingredientManagement: 'ပါဝင်ပစ္စည်း စီမံခန့်ခွဲမှု',
      systemSettings: 'စနစ် ဆက်တင်များ',
      languageEditor: 'ဘာသာစကား တည်းဖြတ်ရန်',
      verifyIngredient: 'ပါဝင်ပစ္စည်း အတည်ပြုမည်',
      unverifyIngredient: 'အတည်ပြုမှု ပြန်ရုပ်သိမ်းမည်',
      makeAdmin: 'အက်ဒမင် ဖြစ်စေမည်',
      removeAdmin: 'အက်ဒမင် ဖယ်ရှားမည်',
      totalUsers: 'စုစုပေါင်း အသုံးပြုသူ',
      totalIngredients: 'စုစုပေါင်း ပါဝင်ပစ္စည်း',
      pendingVerification: 'အတည်ပြုရန် စောင့်ဆိုင်းနေသော',
      recentActivity: 'မကြာသေးမီ လုပ်ဆောင်ချက်များ',
    },
  },
  en: {
    common: {
      appName: 'Smart Calorie Tracker',
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      close: 'Close',
    },
    auth: {
      login: 'Login',
      logout: 'Logout',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password?',
      resetPassword: 'Reset Password',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      signOut: 'Sign Out',
      fullName: 'Full Name',
      displayName: 'Display Name',
      alreadyHaveAccount: 'Already have an account? ',
      dontHaveAccount: "Don't have an account? ",
      emailRequired: 'Email is required',
      passwordRequired: 'Password is required',
      passwordMismatch: 'Passwords do not match',
      loginSuccess: 'Successfully logged in',
      loginError: 'Error logging in',
      registerSuccess: 'Successfully registered',
      registerError: 'Error registering',
    },
    dashboard: {
      title: 'Dashboard',
      todaysCalories: "Today's Calories",
      caloriesRemaining: 'Calories Remaining',
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      snack: 'Snack',
      totalCalories: 'Total Calories',
      protein: 'Protein',
      fat: 'Fat',
      carbs: 'Carbs',
      fiber: 'Fiber',
      streak: 'Streak',
      days: 'days',
      level: 'Level',
      points: 'Points',
    },
    meals: {
      addMeal: 'Add Meal',
      editMeal: 'Edit Meal',
      deleteMeal: 'Delete Meal',
      mealName: 'Meal Name',
      mealType: 'Meal Type',
      ingredients: 'Ingredients',
      portion: 'Portion',
      calories: 'Calories',
      searchIngredients: 'Search Ingredients',
      addIngredient: 'Add Ingredient',
      removeIngredient: 'Remove Ingredient',
      saveMeal: 'Save Meal',
      aiExtract: 'AI Extract',
      describeYourMeal: 'Describe your meal',
      extractingIngredients: 'Extracting ingredients...',
    },
    ingredients: {
      title: 'Ingredients',
      name: 'Name',
      nameEnglish: 'English Name',
      nameMyanmar: 'Myanmar Name',
      category: 'Category',
      calories: 'Calories',
      protein: 'Protein',
      fat: 'Fat',
      carbs: 'Carbs',
      fiber: 'Fiber',
      verified: 'Verified',
      unverified: 'Unverified',
      aiGenerated: 'AI Generated',
      fromDatabase: 'From Database',
      verificationStatus: 'Verification Status',
      dataSource: 'Data Source',
    },
    admin: {
      dashboard: 'Admin Dashboard',
      users: 'Users',
      ingredients: 'Ingredients',
      settings: 'Settings',
      languages: 'Languages',
      userManagement: 'User Management',
      ingredientManagement: 'Ingredient Management',
      systemSettings: 'System Settings',
      languageEditor: 'Language Editor',
      verifyIngredient: 'Verify Ingredient',
      unverifyIngredient: 'Unverify Ingredient',
      makeAdmin: 'Make Admin',
      removeAdmin: 'Remove Admin',
      totalUsers: 'Total Users',
      totalIngredients: 'Total Ingredients',
      pendingVerification: 'Pending Verification',
      recentActivity: 'Recent Activity',
    },
  },
};

export function getTranslation(language: Language): Translations {
  return translations[language];
}
