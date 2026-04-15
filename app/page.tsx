"use client";

import { useEffect, useMemo, useState } from "react";

type CurryRiceLevel = "full" | "many" | "half" | "oneDay" | "empty";
type NeedCategory =
  | "topping"
  | "salad"
  | "drink"
  | "seasoning"
  | "supplies"
  | "other";

type ImportantItem = {
  id: "curry" | "rice";
  name: string;
  level: CurryRiceLevel;
};

type NeedItem = {
  id: string;
  name: string;
  category: NeedCategory;
  checked: boolean;
  quantity: number;
  unit: string;
  note?: string;
};

type HistoryItem = {
  id: string;
  date: string;
  importantItems: ImportantItem[];
  items: {
    id: string;
    name: string;
    category: NeedCategory;
    quantity: number;
    unit: string;
  }[];
};

const STORAGE_KEY = "vinvin_inventory_app_rich_v2";
const HISTORY_KEY = "vinvin_inventory_app_history_v2";

const levelOptions: { value: CurryRiceLevel; label: string; emoji: string }[] = [
  { value: "full", label: "満タン", emoji: "🟢" },
  { value: "many", label: "結構ある", emoji: "🟩" },
  { value: "half", label: "半分くらい", emoji: "🟨" },
  { value: "oneDay", label: "1日分ある", emoji: "🟧" },
  { value: "empty", label: "もう無い", emoji: "🟥" },
];

const importantInitial: ImportantItem[] = [
  { id: "curry", name: "カレー", level: "full" },
  { id: "rice", name: "米", level: "full" },
];

const needItemsInitial: NeedItem[] = [
  { id: "egg", name: "たまご", category: "topping", checked: false, quantity: 1, unit: "個" },
  { id: "tomato", name: "トマト", category: "topping", checked: false, quantity: 1, unit: "個" },
  { id: "green_pepper", name: "ピーマン", category: "topping", checked: false, quantity: 1, unit: "個" },
  { id: "eggplant", name: "なす", category: "topping", checked: false, quantity: 1, unit: "本" },
  { id: "lotus_root", name: "れんこん", category: "topping", checked: false, quantity: 1, unit: "袋" },
  { id: "shimeji", name: "しめじ", category: "topping", checked: false, quantity: 1, unit: "袋" },
  { id: "eringi", name: "エリンギ", category: "topping", checked: false, quantity: 1, unit: "袋" },
  { id: "maitake", name: "まいたけ", category: "topping", checked: false, quantity: 1, unit: "袋" },
  { id: "butter", name: "バター", category: "topping", checked: false, quantity: 1, unit: "個" },
  { id: "ebi_katsu", name: "海老カツ", category: "topping", checked: false, quantity: 1, unit: "袋" },
  { id: "corn_croquette", name: "コーンクリームコロッケ", category: "topping", checked: false, quantity: 1, unit: "袋" },
  { id: "tonkatsu", name: "とんかつ", category: "topping", checked: false, quantity: 1, unit: "袋" },
  { id: "bacon", name: "ベーコン", category: "topping", checked: false, quantity: 1, unit: "袋" },
  { id: "fried_onion", name: "フライドオニオン", category: "topping", checked: false, quantity: 1, unit: "袋" },
  { id: "melting_cheese", name: "とろけるチーズ", category: "topping", checked: false, quantity: 1, unit: "袋" },
  { id: "powder_cheese", name: "粉チーズ", category: "topping", checked: false, quantity: 1, unit: "本" },
  { id: "raclette", name: "ラクレット", category: "topping", checked: false, quantity: 1, unit: "袋" },
  {
    id: "ginger_pickles",
    name: "生姜のピクルス",
    category: "topping",
    checked: false,
    quantity: 1,
    unit: "回",
    note: "そろそろ仕込みならチェック",
  },
  { id: "harissa_topping", name: "ハリッサ", category: "topping", checked: false, quantity: 1, unit: "本" },

  { id: "lettuce", name: "レタス", category: "salad", checked: false, quantity: 1, unit: "個" },
  { id: "carrot", name: "にんじん", category: "salad", checked: false, quantity: 1, unit: "本" },
  { id: "lemon", name: "レモン", category: "salad", checked: false, quantity: 1, unit: "個" },
  { id: "salad_dressing", name: "ドレッシング", category: "salad", checked: false, quantity: 1, unit: "本" },

  { id: "beer_keg", name: "ビールの樽", category: "drink", checked: false, quantity: 1, unit: "本" },
  { id: "highball_keg", name: "ハイボールの樽", category: "drink", checked: false, quantity: 1, unit: "本" },
  { id: "non_alcohol_beer", name: "ノンアルビール小瓶", category: "drink", checked: false, quantity: 1, unit: "本" },
  { id: "red_wine", name: "赤ワイン", category: "drink", checked: false, quantity: 1, unit: "本" },
  { id: "white_wine", name: "白ワイン", category: "drink", checked: false, quantity: 1, unit: "本" },
  { id: "bottle_cola", name: "瓶コーラ", category: "drink", checked: false, quantity: 1, unit: "本" },
  { id: "ginger_ale", name: "ジンジャエール", category: "drink", checked: false, quantity: 1, unit: "本" },
  { id: "calpis", name: "カルピス", category: "drink", checked: false, quantity: 1, unit: "本" },
  { id: "lemon_tea", name: "レモンティー", category: "drink", checked: false, quantity: 1, unit: "本" },
  { id: "oolong_tea", name: "ウーロン茶", category: "drink", checked: false, quantity: 1, unit: "本" },
  { id: "iced_coffee", name: "アイスコーヒー", category: "drink", checked: false, quantity: 1, unit: "本" },

  { id: "salt", name: "しお", category: "seasoning", checked: false, quantity: 1, unit: "袋" },
  { id: "black_pepper", name: "ブラックペッパー", category: "seasoning", checked: false, quantity: 1, unit: "本" },
  { id: "soy_sauce", name: "しょうゆ", category: "seasoning", checked: false, quantity: 1, unit: "本" },
  { id: "oil_can", name: "あぶら（一斗缶）", category: "seasoning", checked: false, quantity: 1, unit: "缶" },
  { id: "oil_bottle", name: "あぶら（ボトル）", category: "seasoning", checked: false, quantity: 1, unit: "本" },
  { id: "harissa_seasoning", name: "ハリッサ", category: "seasoning", checked: false, quantity: 1, unit: "本" },
  { id: "apple_vinegar", name: "リンゴ酢", category: "seasoning", checked: false, quantity: 1, unit: "本" },
  { id: "dressing_seasoning", name: "ドレッシング", category: "seasoning", checked: false, quantity: 1, unit: "本" },

  { id: "bleach", name: "漂白剤", category: "supplies", checked: false, quantity: 1, unit: "本" },
  { id: "dish_soap", name: "食器洗剤", category: "supplies", checked: false, quantity: 1, unit: "本" },
  { id: "kitchen_paper", name: "キッチンペーパー", category: "supplies", checked: false, quantity: 1, unit: "袋" },
  { id: "tissue", name: "ティッシュ", category: "supplies", checked: false, quantity: 1, unit: "箱" },
  { id: "wet_towel", name: "おしぼり", category: "supplies", checked: false, quantity: 1, unit: "袋" },
  { id: "spoon", name: "スプーン", category: "supplies", checked: false, quantity: 1, unit: "袋" },
  { id: "takeout_box", name: "テイクアウト容器", category: "supplies", checked: false, quantity: 1, unit: "袋" },
  { id: "duster", name: "ダスター", category: "supplies", checked: false, quantity: 1, unit: "枚" },

  { id: "snacks", name: "お菓子買って欲しい", category: "other", checked: false, quantity: 1, unit: "個" },
  { id: "hot_drinks", name: "あったかい飲み物買って欲しい", category: "other", checked: false, quantity: 1, unit: "本" },
];

function getLevelMeta(level: CurryRiceLevel) {
  return levelOptions.find((option) => option.value === level) ?? levelOptions[0];
}

function getAttentionText(item: ImportantItem) {
  if (item.level === "oneDay") {
    return item.id === "rice" ? "⚠️ 明日までに精米チェック" : "⚠️ 明日分だけ";
  }
  if (item.level === "empty") {
    return item.id === "rice" ? "🚨 すぐ精米・補充したい" : "🚨 すぐ仕込み・補充したい";
  }
  return "今のところOK";
}

function categoryLabel(category: NeedCategory) {
  switch (category) {
    case "topping":
      return "トッピング";
    case "salad":
      return "サラダ・おひや";
    case "drink":
      return "ドリンク";
    case "seasoning":
      return "調味料";
    case "supplies":
      return "備品・消耗品";
    case "other":
      return "その他";
    default:
      return "";
  }
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function Page() {
  const [importantItems, setImportantItems] = useState<ImportantItem[]>(importantInitial);
  const [needItems, setNeedItems] = useState<NeedItem[]>(needItemsInitial);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<NeedCategory>("other");
  const [newItemUnit, setNewItemUnit] = useState("個");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedWork = localStorage.getItem(STORAGE_KEY);
      if (savedWork) {
        const parsed = JSON.parse(savedWork) as {
          importantItems?: ImportantItem[];
          needItems?: NeedItem[];
        };
        if (parsed.importantItems) setImportantItems(parsed.importantItems);
        if (parsed.needItems) setNeedItems(parsed.needItems);
      }

      const savedHistory = localStorage.getItem(HISTORY_KEY);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory) as HistoryItem[];
        setHistory(parsedHistory);
      }
    } catch (error) {
      console.error("保存データの読み込みに失敗しました", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          importantItems,
          needItems,
        })
      );
    } catch (error) {
      console.error("作業データの保存に失敗しました", error);
    }
  }, [importantItems, needItems, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("履歴の保存に失敗しました", error);
    }
  }, [history, isLoaded]);

  const updateImportantLevel = (id: ImportantItem["id"], level: CurryRiceLevel) => {
    setImportantItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, level } : item))
    );
  };

  const toggleNeedItem = (id: string) => {
    setNeedItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              checked: !item.checked,
              quantity: item.quantity > 0 ? item.quantity : 1,
            }
          : item
      )
    );
  };

  const updateQuantity = (id: string, quantity: number) => {
    setNeedItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Number.isNaN(quantity) ? 1 : Math.max(1, quantity),
            }
          : item
      )
    );
  };

  const addNewItem = () => {
    const trimmedName = newItemName.trim();
    const trimmedUnit = newItemUnit.trim();

    if (!trimmedName) return;

    const newItem: NeedItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: trimmedName,
      category: newItemCategory,
      checked: false,
      quantity: 1,
      unit: trimmedUnit || "個",
    };

    setNeedItems((prev) => [newItem, ...prev]);
    setNewItemName("");
    setNewItemCategory("other");
    setNewItemUnit("個");
  };

  const removeCustomItem = (id: string) => {
    const ok = window.confirm("この項目を削除する？");
    if (!ok) return;
    setNeedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const saveHistory = () => {
    const checked = needItems.filter((item) => item.checked);
    if (checked.length === 0) {
      window.alert("保存する買い物項目がまだないよ");
      return;
    }

    const newHistory: HistoryItem = {
      id: `${Date.now()}`,
      date: formatDateTime(new Date()),
      importantItems: importantItems.map((item) => ({ ...item })),
      items: checked.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
      })),
    };

    setHistory((prev) => [newHistory, ...prev]);
    window.alert("履歴保存したよ 🙌");
  };

  const restoreHistory = (historyId: string) => {
    const target = history.find((item) => item.id === historyId);
    if (!target) return;

    const ok = window.confirm("この履歴の内容を今の買い物リストに反映する？");
    if (!ok) return;

    setImportantItems(target.importantItems);

    setNeedItems((prev) =>
      prev.map((item) => {
        const found = target.items.find((historyItem) => historyItem.id === item.id);
        if (!found) {
          return { ...item, checked: false, quantity: 1 };
        }
        return {
          ...item,
          checked: true,
          quantity: found.quantity,
        };
      })
    );
  };

  const deleteHistory = (historyId: string) => {
    const ok = window.confirm("この履歴を削除する？");
    if (!ok) return;
    setHistory((prev) => prev.filter((item) => item.id !== historyId));
  };

  const resetAllData = () => {
    const ok = window.confirm(
      "今のチェック状態と追加項目をリセットする？\n※保存済みの履歴は残ります"
    );
    if (!ok) return;

    setImportantItems(importantInitial);
    setNeedItems(needItemsInitial);
    setSearch("");
    setNewItemName("");
    setNewItemCategory("other");
    setNewItemUnit("個");
  };

  const filteredNeedItems = useMemo(() => {
    return needItems.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [needItems, search]);

  const lowImportantItems = importantItems.filter(
    (item) => item.level === "oneDay" || item.level === "empty"
  );

  const checkedItems = needItems.filter((item) => item.checked);
  const prepCheckList = needItems.filter(
    (item) => item.id === "ginger_pickles" && item.checked
  );

  const groupedCategories: NeedCategory[] = [
    "topping",
    "salad",
    "drink",
    "seasoning",
    "supplies",
    "other",
  ];

  const groupedCheckedItems = groupedCategories
    .map((category) => ({
      category,
      items: checkedItems.filter((item) => item.category === category),
    }))
    .filter((group) => group.items.length > 0);

  const buildMailBody = () => {
    const lines: string[] = [];
    lines.push("買い物指示です。", "");
  
    lines.push("【カレー・米の残量】");
  
    importantItems.forEach((item) => {
      const meta = getLevelMeta(item.level);
      let extra = "";
  
      if (item.name === "米") {
        if (item.level === "half") {
          extra = "（そろそろ精米）";
        }
        if (item.level === "oneDay") {
          extra = "（精米必要）";
        }
        if (item.level === "empty") {
          extra = "（至急 精米！）";
        }
      }
  
      if (item.name === "カレー") {
        if (item.level === "half") {
          extra = "（仕込み準備）";
        }
        if (item.level === "oneDay") {
          extra = "（仕込み必要）";
        }
        if (item.level === "empty") {
          extra = "（至急 仕込み！）";
        }
      }
  
      lines.push(`・${item.name}：${meta.label}${extra ? ` ${extra}` : ""}`);
    });
  
    lines.push("");
  
    if (checkedItems.length === 0) {
      lines.push("現在、買うものはありません。", "");
    } else {
      groupedCheckedItems.forEach((group) => {
        lines.push(`【${categoryLabel(group.category)}】`);
        group.items.forEach((item) => {
          lines.push(`・${item.name} ${item.quantity}${item.unit}`);
        });
        lines.push("");
      });
    }
  
    lines.push("発注・仕込み 指示Appより");
    return lines.join("\n");
  };

  const handleMailTo = () => {
    const subject = encodeURIComponent("VinVinCURRY 買い物指示");
    const body = encodeURIComponent(buildMailBody());
    window.location.href = `mailto:chii.k.k.1207.1208.0701@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <main className="min-h-screen bg-neutral-50 p-6 text-neutral-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold">📦 発注・仕込み 指示App</h1>
              <p className="mt-2 text-sm text-neutral-600">
                カレー・米は5段階評価、それ以外は必要なものだけチェックして個数入力
              </p>
            </div>

            <button
              type="button"
              onClick={resetAllData}
              className="rounded-2xl border border-neutral-200 px-4 py-3 text-sm font-semibold transition hover:bg-neutral-50"
            >
              リセット
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleMailTo}
              className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              📩 買い物指示をメールする
            </button>
            <button
              type="button"
              onClick={saveHistory}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              🕘 履歴として保存
            </button>
            <div className="rounded-2xl bg-neutral-100 px-4 py-3 text-sm text-neutral-600">
              {isLoaded ? "💾 自動保存中" : "⏳ 保存データを読み込み中"}
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="text-sm text-neutral-600">重要チェック</p>
              <p className="mt-1 text-2xl font-bold">{lowImportantItems.length}件</p>
              <p className="mt-1 text-xs text-neutral-500">カレー・米の不足気味だけ表示</p>
            </div>

            <div className="rounded-2xl bg-rose-50 p-4">
              <p className="text-sm text-neutral-600">買うもの</p>
              <p className="mt-1 text-2xl font-bold">{checkedItems.length}件</p>
              <p className="mt-1 text-xs text-neutral-500">必要なものだけ右に出る</p>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-sm text-neutral-600">仕込みチェック</p>
              <p className="mt-1 text-2xl font-bold">{prepCheckList.length}件</p>
              <p className="mt-1 text-xs text-neutral-500">生姜のピクルス確認用</p>
            </div>

            <div className="rounded-2xl bg-sky-50 p-4">
              <p className="text-sm text-neutral-600">入力の考え方</p>
              <p className="mt-1 text-base font-bold">必要なものだけ触る</p>
              <p className="mt-1 text-xs text-neutral-500">全部このルールで統一</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="mb-4">
            <h2 className="text-xl font-bold">➕ 項目を追加</h2>
            <p className="text-sm text-neutral-500">新しい買い物項目をその場で増やせる</p>
          </div>

          <div className="grid gap-3 md:grid-cols-[1.4fr_180px_120px_120px]">
            <input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="項目名（例：紙ナプキン）"
              className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-400"
            />

            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value as NeedCategory)}
              className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-400"
            >
              {groupedCategories.map((category) => (
                <option key={category} value={category}>
                  {categoryLabel(category)}
                </option>
              ))}
            </select>

            <input
              value={newItemUnit}
              onChange={(e) => setNewItemUnit(e.target.value)}
              placeholder="単位"
              className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-400"
            />

            <button
              type="button"
              onClick={addNewItem}
              className="rounded-2xl bg-neutral-900 px-4 py-3 font-semibold text-white transition hover:opacity-90"
            >
              追加
            </button>
          </div>
        </section>

        <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="商品名で検索"
            className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-400"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <section className="space-y-6">
            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <div className="mb-4">
                <h2 className="text-xl font-bold">重要</h2>
                <p className="text-sm text-neutral-500">カレーと米は5段階評価で入力</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {importantItems.map((item) => {
                  const meta = getLevelMeta(item.level);

                  return (
                    <div key={item.id} className="rounded-2xl border border-neutral-200 p-4">
                      <div className="mb-3">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-neutral-500">
                          {meta.emoji} {meta.label}
                        </p>
                      </div>

                      <div className="grid gap-2">
                        {levelOptions.map((option) => {
                          const active = item.level === option.value;

                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => updateImportantLevel(item.id, option.value)}
                              className={`rounded-2xl border px-4 py-3 text-left transition ${
                                active
                                  ? "border-neutral-900 bg-neutral-900 text-white"
                                  : "border-neutral-200 bg-white hover:bg-neutral-50"
                              }`}
                            >
                              <span className="font-semibold">
                                {option.emoji} {option.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-3 rounded-2xl bg-neutral-50 p-3 text-sm text-neutral-600">
                        {getAttentionText(item)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {groupedCategories.map((category) => {
              const categoryItems = filteredNeedItems.filter(
                (item) => item.category === category
              );
              if (categoryItems.length === 0) return null;

              return (
                <section
                  key={category}
                  className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5"
                >
                  <div className="mb-4">
                    <h2 className="text-xl font-bold">{categoryLabel(category)}</h2>
                    <p className="text-sm text-neutral-500">
                      必要なものをタップして個数入力
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className={`rounded-2xl border p-4 transition ${
                          item.checked
                            ? "border-neutral-900 bg-neutral-900 text-white"
                            : "border-neutral-200 bg-white"
                        }`}
                      >
                        <div className="grid gap-3">
                          <button
                            type="button"
                            onClick={() => toggleNeedItem(item.id)}
                            className="text-left"
                          >
                            <p className="font-semibold">
                              {item.checked ? "✅" : "⬜️"} {item.name}
                            </p>
                            <p
                              className={`mt-1 text-sm ${
                                item.checked ? "text-neutral-200" : "text-neutral-500"
                              }`}
                            >
                              {item.note ?? (item.checked ? "買うリストに入ってる" : "必要ならタップ")}
                            </p>
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={!item.checked}
                              onClick={() =>
                                updateQuantity(item.id, Math.max(1, item.quantity - 1))
                              }
                              className="px-3 py-2 rounded-lg border"
                            >
                              −
                            </button>

                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              disabled={!item.checked}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) =>
                                updateQuantity(item.id, Number(e.target.value))
                              }
                              className="w-16 text-center rounded-lg border"
                            />

                            <button
                              type="button"
                              disabled={!item.checked}
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="px-3 py-2 rounded-lg border"
                            >
                              ＋
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <h2 className="text-lg font-bold">🍛 重要チェック</h2>
              <div className="mt-3 space-y-2">
                {importantItems.map((item) => {
                  const meta = getLevelMeta(item.level);

                  return (
                    <div key={item.id} className="rounded-2xl bg-neutral-50 p-3 text-sm">
                      <p className="font-semibold">{item.name}</p>
                      <p>
                        {meta.emoji} {meta.label}
                      </p>
                      <p className="text-neutral-500">{getAttentionText(item)}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold">🛒 買うもの一覧</h2>
                <button
                  type="button"
                  onClick={handleMailTo}
                  className="rounded-xl bg-neutral-900 px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                >
                  メールする
                </button>
              </div>

              <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {checkedItems.length === 0 ? (
                  <p className="text-sm text-neutral-500">いまのところ候補なし</p>
                ) : (
                  groupedCheckedItems.map((group) => (
                    <div key={group.category} className="rounded-2xl bg-neutral-50 p-3 text-sm">
                      <p className="mb-2 font-bold">{categoryLabel(group.category)}</p>
                      <div className="space-y-1">
                        {group.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-2">
                            <span>{item.name}</span>
                            <span className="text-neutral-600">
                              {item.quantity}
                              {item.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <h2 className="text-lg font-bold">🥒 仕込みチェック</h2>
              <div className="mt-3 space-y-2">
                {prepCheckList.length === 0 ? (
                  <p className="text-sm text-neutral-500">今は急ぎなし</p>
                ) : (
                  prepCheckList.map((item) => (
                    <div key={item.id} className="rounded-2xl bg-neutral-50 p-3 text-sm">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-neutral-600">
                        {item.quantity}
                        {item.unit}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold">🕘 保存履歴</h2>
                <span className="text-xs text-neutral-500">{history.length}件</span>
              </div>

              <div className="mt-3 space-y-3">
                {history.length === 0 ? (
                  <p className="text-sm text-neutral-500">まだ履歴なし</p>
                ) : (
                  history.map((entry) => (
                    <div key={entry.id} className="rounded-2xl bg-neutral-50 p-3 text-sm">
                      <p className="font-semibold">{entry.date}</p>

                      <div className="mt-2 space-y-1 text-neutral-600">
                        {entry.items.map((item, index) => (
                          <div
                            key={`${entry.id}-${index}`}
                            className="flex items-center justify-between gap-2"
                          >
                            <span>{item.name}</span>
                            <span>
                              {item.quantity}
                              {item.unit}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => restoreHistory(entry.id)}
                          className="rounded-xl bg-neutral-900 px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                        >
                          この内容を復元
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteHistory(entry.id)}
                          className="rounded-xl border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-white"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}