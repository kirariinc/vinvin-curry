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

const WORK_STORAGE_KEY = "vinvin_inventory_app_work_v4";
const HISTORY_STORAGE_KEY = "vinvin_inventory_app_history_v4";
const MAIL_TO = "chii.k.k.1207.1208.0701@gmail.com";

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
  { id: "egg", name: "たまご", category: "topping", quantity: 0, unit: "個" },
  { id: "tomato", name: "トマト", category: "topping", quantity: 0, unit: "個" },
  { id: "green_pepper", name: "ピーマン", category: "topping", quantity: 0, unit: "個" },
  { id: "eggplant", name: "なす", category: "topping", quantity: 0, unit: "本" },
  { id: "lotus_root", name: "れんこん", category: "topping", quantity: 0, unit: "袋" },
  { id: "shimeji", name: "しめじ", category: "topping", quantity: 0, unit: "袋" },
  { id: "eringi", name: "エリンギ", category: "topping", quantity: 0, unit: "袋" },
  { id: "maitake", name: "まいたけ", category: "topping", quantity: 0, unit: "袋" },
  { id: "butter", name: "バター", category: "topping", quantity: 0, unit: "個" },
  { id: "ebi_katsu", name: "海老カツ", category: "topping", quantity: 0, unit: "袋" },
  { id: "corn_croquette", name: "コーンクリームコロッケ", category: "topping", quantity: 0, unit: "袋" },
  { id: "tonkatsu", name: "とんかつ", category: "topping", quantity: 0, unit: "袋" },
  { id: "bacon", name: "ベーコン", category: "topping", quantity: 0, unit: "袋" },
  { id: "fried_onion", name: "フライドオニオン", category: "topping", quantity: 0, unit: "袋" },
  { id: "melting_cheese", name: "とろけるチーズ", category: "topping", quantity: 0, unit: "袋" },
  { id: "powder_cheese", name: "粉チーズ", category: "topping", quantity: 0, unit: "本" },
  { id: "raclette", name: "ラクレット", category: "topping", quantity: 0, unit: "袋" },
  {
    id: "ginger_pickles",
    name: "生姜のピクルス",
    category: "topping",
    quantity: 0,
    unit: "回",
    note: "そろそろ仕込みなら個数を入れる",
  },
  { id: "harissa_topping", name: "ハリッサ", category: "topping", quantity: 0, unit: "本" },

  { id: "lettuce", name: "レタス", category: "salad", quantity: 0, unit: "個" },
  { id: "carrot", name: "にんじん", category: "salad", quantity: 0, unit: "本" },
  { id: "lemon", name: "レモン", category: "salad", quantity: 0, unit: "個" },
  { id: "salad_dressing", name: "ドレッシング", category: "salad", quantity: 0, unit: "本" },

  { id: "beer_keg", name: "ビールの樽", category: "drink", quantity: 0, unit: "本" },
  { id: "highball_keg", name: "ハイボールの樽", category: "drink", quantity: 0, unit: "本" },
  { id: "non_alcohol_beer", name: "ノンアルビール小瓶", category: "drink", quantity: 0, unit: "本" },
  { id: "red_wine", name: "赤ワイン", category: "drink", quantity: 0, unit: "本" },
  { id: "white_wine", name: "白ワイン", category: "drink", quantity: 0, unit: "本" },
  { id: "bottle_cola", name: "瓶コーラ", category: "drink", quantity: 0, unit: "本" },
  { id: "ginger_ale", name: "ジンジャエール", category: "drink", quantity: 0, unit: "本" },
  { id: "calpis", name: "カルピス", category: "drink", quantity: 0, unit: "本" },
  { id: "lemon_tea", name: "レモンティー", category: "drink", quantity: 0, unit: "本" },
  { id: "oolong_tea", name: "ウーロン茶", category: "drink", quantity: 0, unit: "本" },
  { id: "iced_coffee", name: "アイスコーヒー", category: "drink", quantity: 0, unit: "本" },

  { id: "salt", name: "しお", category: "seasoning", quantity: 0, unit: "袋" },
  { id: "black_pepper", name: "ブラックペッパー", category: "seasoning", quantity: 0, unit: "本" },
  { id: "soy_sauce", name: "しょうゆ", category: "seasoning", quantity: 0, unit: "本" },
  { id: "oil_can", name: "あぶら（一斗缶）", category: "seasoning", quantity: 0, unit: "缶" },
  { id: "oil_bottle", name: "あぶら（ボトル）", category: "seasoning", quantity: 0, unit: "本" },
  { id: "harissa_seasoning", name: "ハリッサ", category: "seasoning", quantity: 0, unit: "本" },
  { id: "apple_vinegar", name: "リンゴ酢", category: "seasoning", quantity: 0, unit: "本" },
  { id: "dressing_seasoning", name: "ドレッシング", category: "seasoning", quantity: 0, unit: "本" },

  { id: "bleach", name: "漂白剤", category: "supplies", quantity: 0, unit: "本" },
  { id: "dish_soap", name: "食器洗剤", category: "supplies", quantity: 0, unit: "本" },
  { id: "kitchen_paper", name: "キッチンペーパー", category: "supplies", quantity: 0, unit: "袋" },
  { id: "tissue", name: "ティッシュ", category: "supplies", quantity: 0, unit: "箱" },
  { id: "wet_towel", name: "おしぼり", category: "supplies", quantity: 0, unit: "袋" },
  { id: "spoon", name: "スプーン", category: "supplies", quantity: 0, unit: "袋" },
  { id: "takeout_box", name: "テイクアウト容器", category: "supplies", quantity: 0, unit: "袋" },
  { id: "duster", name: "ダスター", category: "supplies", quantity: 0, unit: "枚" },

  { id: "snacks", name: "お菓子買って欲しい", category: "other", quantity: 0, unit: "個" },
  { id: "hot_drinks", name: "あったかい飲み物買って欲しい", category: "other", quantity: 0, unit: "本" },
];

function getLevelMeta(level: CurryRiceLevel) {
  return levelOptions.find((option) => option.value === level) ?? levelOptions[0];
}

function getAttentionText(item: ImportantItem) {
  if (item.id === "rice") {
    if (item.level === "half") return "⚠️ そろそろ精米";
    if (item.level === "oneDay") return "⚠️ 精米必要";
    if (item.level === "empty") return "🚨 至急 精米！";
    return "今のところOK";
  }

  if (item.id === "curry") {
    if (item.level === "half") return "⚠️ 仕込み準備";
    if (item.level === "oneDay") return "⚠️ 仕込み必要";
    if (item.level === "empty") return "🚨 至急 仕込み！";
    return "今のところOK";
  }

  return "今のところOK";
}

function getMailExtraText(item: ImportantItem) {
  if (item.id === "rice") {
    if (item.level === "half") return "（そろそろ精米）";
    if (item.level === "oneDay") return "（精米必要）";
    if (item.level === "empty") return "（至急 精米！）";
  }

  if (item.id === "curry") {
    if (item.level === "half") return "（仕込み準備）";
    if (item.level === "oneDay") return "（仕込み必要）";
    if (item.level === "empty") return "（至急 仕込み！）";
  }

  return "";
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

function mergeNeedItems(saved: NeedItem[], initial: NeedItem[]) {
  const initialMap = new Map(initial.map((item) => [item.id, item]));
  const savedMap = new Map(saved.map((item) => [item.id, item]));

  const merged = initial.map((initialItem) => {
    const savedItem = savedMap.get(initialItem.id);
    return savedItem
      ? {
          ...initialItem,
          ...savedItem,
        }
      : initialItem;
  });

  const customOnly = saved.filter((savedItem) => !initialMap.has(savedItem.id));

  return [...customOnly, ...merged];
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
  const [mustSaveBeforeMail, setMustSaveBeforeMail] = useState(true);

  useEffect(() => {
    try {
      const savedWork = localStorage.getItem(WORK_STORAGE_KEY);
      if (savedWork) {
        const parsed = JSON.parse(savedWork) as {
          importantItems?: ImportantItem[];
          needItems?: NeedItem[];
          mustSaveBeforeMail?: boolean;
        };

        if (parsed.importantItems) setImportantItems(parsed.importantItems);
        if (parsed.needItems) {
          setNeedItems(mergeNeedItems(parsed.needItems, needItemsInitial));
        }
        if (typeof parsed.mustSaveBeforeMail === "boolean") {
          setMustSaveBeforeMail(parsed.mustSaveBeforeMail);
        }
      }

      const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
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
        WORK_STORAGE_KEY,
        JSON.stringify({
          importantItems,
          needItems,
          mustSaveBeforeMail,
        })
      );
    } catch (error) {
      console.error("作業データの保存に失敗しました", error);
    }
  }, [importantItems, needItems, mustSaveBeforeMail, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("履歴の保存に失敗しました", error);
    }
  }, [history, isLoaded]);

  const markDirty = () => setMustSaveBeforeMail(true);

  const updateImportantLevel = (id: ImportantItem["id"], level: CurryRiceLevel) => {
    setImportantItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, level } : item))
    );
    markDirty();
  };

  const updateQuantity = (id: string, quantity: number) => {
    setNeedItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(0, Number(quantity) || 0),
            }
          : item
      )
    );
    markDirty();
  };

  const addNewItem = () => {
    const trimmedName = newItemName.trim();
    const trimmedUnit = newItemUnit.trim();

    if (!trimmedName) return;

    const newItem: NeedItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: trimmedName,
      category: newItemCategory,
      quantity: 0,
      unit: trimmedUnit || "個",
    };

    setNeedItems((prev) => [newItem, ...prev]);
    setNewItemName("");
    setNewItemCategory("other");
    setNewItemUnit("個");
    markDirty();
  };

  const removeCustomItem = (id: string) => {
    const ok = window.confirm("この項目を削除する？");
    if (!ok) return;
    setNeedItems((prev) => prev.filter((item) => item.id !== id));
    markDirty();
  };

  const saveHistory = () => {
    const selectedItems = needItems.filter((item) => item.quantity > 0);
    if (selectedItems.length === 0) {
      window.alert("保存する発注項目がまだないよ");
      return;
    }

    const newHistory: HistoryItem = {
      id: `${Date.now()}`,
      date: formatDateTime(new Date()),
      importantItems: importantItems.map((item) => ({ ...item })),
      items: selectedItems.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
      })),
    };

    setHistory((prev) => [newHistory, ...prev]);
    setMustSaveBeforeMail(false);
    window.alert("履歴保存したよ！次はメール送信してね 🙌");
  };

  const restoreHistory = (historyId: string) => {
    const target = history.find((item) => item.id === historyId);
    if (!target) return;

    const ok = window.confirm("この履歴の内容を今の指示リストに反映する？");
    if (!ok) return;

    setImportantItems(target.importantItems);

    setNeedItems((prev) =>
      prev.map((item) => {
        const found = target.items.find((historyItem) => historyItem.id === item.id);
        if (!found) {
          return { ...item, quantity: 0 };
        }
        return {
          ...item,
          quantity: found.quantity,
        };
      })
    );

    setMustSaveBeforeMail(true);
  };

  const deleteHistory = (historyId: string) => {
    const ok = window.confirm("この履歴を削除する？");
    if (!ok) return;
    setHistory((prev) => prev.filter((item) => item.id !== historyId));
  };

  const resetAllData = () => {
    const ok = window.confirm(
      "今の入力中の内容をリセットする？\n※保存済みの履歴は残ります"
    );
    if (!ok) return;

    setImportantItems(importantInitial);
    setNeedItems(needItemsInitial);
    setSearch("");
    setNewItemName("");
    setNewItemCategory("other");
    setNewItemUnit("個");
    setMustSaveBeforeMail(true);
  };

  const filteredNeedItems = useMemo(() => {
    return needItems.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [needItems, search]);

  const lowImportantItems = importantItems.filter(
    (item) => item.level === "half" || item.level === "oneDay" || item.level === "empty"
  );

  const selectedItems = needItems.filter((item) => item.quantity > 0);

  const prepCheckList = needItems.filter(
    (item) => item.id === "ginger_pickles" && item.quantity > 0
  );

  const groupedCategories: NeedCategory[] = [
    "topping",
    "salad",
    "drink",
    "seasoning",
    "supplies",
    "other",
  ];

  const groupedSelectedItems = groupedCategories
    .map((category) => ({
      category,
      items: selectedItems.filter((item) => item.category === category),
    }))
    .filter((group) => group.items.length > 0);

  const buildMailBody = () => {
    const lines: string[] = [];
    lines.push("発注・仕込み指示です。", "");

    lines.push("【カレー・米の残量】");
    importantItems.forEach((item) => {
      const meta = getLevelMeta(item.level);
      const extra = getMailExtraText(item);
      lines.push(`・${item.name}：${meta.label}${extra ? ` ${extra}` : ""}`);
    });
    lines.push("");

    if (selectedItems.length === 0) {
      lines.push("現在、発注するものはありません。", "");
    } else {
      groupedSelectedItems.forEach((group) => {
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
    if (mustSaveBeforeMail) {
      window.alert("先に『履歴として保存』してからメールしてね！");
      return;
    }

    const subject = encodeURIComponent("VinVinCURRY 発注・仕込み指示");
    const body = encodeURIComponent(buildMailBody());
    window.location.href = `mailto:${MAIL_TO}?subject=${subject}&body=${body}`;
  };

  const ActionButtons = () => (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={saveHistory}
        className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
      >
        ① 履歴として保存
      </button>

      <button
        type="button"
        onClick={handleMailTo}
        disabled={mustSaveBeforeMail}
        className={`rounded-2xl px-5 py-3 text-sm font-semibold text-white transition ${
          mustSaveBeforeMail
            ? "cursor-not-allowed bg-neutral-300"
            : "bg-neutral-900 hover:opacity-90"
        }`}
      >
        ② メールする
      </button>
    </div>
  );

  return (
    <main className="min-h-screen bg-neutral-50 p-6 text-neutral-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold">発注・仕込み 指示App</h1>
              <p className="mt-2 text-sm text-neutral-600">
                ①履歴保存 → ②メール送信 の順で運用
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

          <div className="mt-4">
            <ActionButtons />
          </div>

          <div className="mt-3 flex flex-wrap gap-3">
            <div className="rounded-2xl bg-neutral-100 px-4 py-3 text-sm text-neutral-600">
              {isLoaded ? "💾 自動保存中" : "⏳ 保存データを読み込み中"}
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
            {mustSaveBeforeMail
              ? "変更あり：先に『履歴として保存』するとメール送信できるよ"
              : "保存済み：このままメール送信OK"}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="text-sm text-neutral-600">重要チェック</p>
              <p className="mt-1 text-2xl font-bold">{lowImportantItems.length}件</p>
              <p className="mt-1 text-xs text-neutral-500">カレー・米の注意だけ表示</p>
            </div>

            <div className="rounded-2xl bg-rose-50 p-4">
              <p className="text-sm text-neutral-600">発注候補</p>
              <p className="mt-1 text-2xl font-bold">{selectedItems.length}件</p>
              <p className="mt-1 text-xs text-neutral-500">個数が1以上のものだけ対象</p>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-sm text-neutral-600">仕込みチェック</p>
              <p className="mt-1 text-2xl font-bold">{prepCheckList.length}件</p>
              <p className="mt-1 text-xs text-neutral-500">生姜のピクルス確認用</p>
            </div>

            <div className="rounded-2xl bg-sky-50 p-4">
              <p className="text-sm text-neutral-600">運用ルール</p>
              <p className="mt-1 text-base font-bold">保存 → メール</p>
              <p className="mt-1 text-xs text-neutral-500">順番固定でミス防止</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="mb-4">
            <h2 className="text-xl font-bold">➕ 項目を追加</h2>
            <p className="text-sm text-neutral-500">新しい発注項目をその場で増やせる</p>
          </div>

          <div className="grid gap-3 md:grid-cols-[1.4fr_180px_120px_120px]">
            <input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="項目名（例：ファブリーズ）"
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
                      必要な個数を入れたものだけ発注対象
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {categoryItems.map((item) => {
                      const active = item.quantity > 0;

                      return (
                        <div
                          key={item.id}
                          className={`rounded-2xl border p-4 transition ${
                            active
                              ? "border-neutral-900 bg-neutral-900 text-white"
                              : "border-neutral-200 bg-white"
                          }`}
                        >
                          <div className="grid gap-3">
                            <div className="text-left">
                              <p className="font-semibold">{item.name}</p>
                              <p
                                className={`mt-1 text-sm ${
                                  active ? "text-neutral-200" : "text-neutral-500"
                                }`}
                              >
                                {item.note ?? (active ? "発注リストに入ってる" : "必要なら個数を入れる")}
                              </p>
                            </div>

                            <div className="grid grid-cols-[1fr_88px] gap-2 items-end">
                              <label className="block">
                                <span
                                  className={`mb-1 block text-xs ${
                                    active ? "text-neutral-200" : "text-neutral-500"
                                  }`}
                                >
                                  必要な個数
                                </span>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className={`min-w-10 rounded-xl px-3 py-2 text-sm font-semibold ${
                                      active
                                        ? "border border-white/20 bg-white text-neutral-900"
                                        : "border border-neutral-200 bg-neutral-50 text-neutral-500"
                                    }`}
                                  >
                                    −
                                  </button>

                                  <input
                                    type="number"
                                    min={0}
                                    value={item.quantity}
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) =>
                                      updateQuantity(item.id, Number(e.target.value))
                                    }
                                    className={`w-16 text-center rounded-xl px-2 py-2 ${
                                      active
                                        ? "border border-white/20 bg-white text-neutral-900"
                                        : "border border-neutral-200 bg-neutral-50 text-neutral-900"
                                    }`}
                                  />

                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className={`min-w-10 rounded-xl px-3 py-2 text-sm font-semibold ${
                                      active
                                        ? "border border-white/20 bg-white text-neutral-900"
                                        : "border border-neutral-200 bg-neutral-50 text-neutral-500"
                                    }`}
                                  >
                                    +
                                  </button>
                                </div>
                              </label>

                              <button
                                type="button"
                                onClick={() => removeCustomItem(item.id)}
                                className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                                  active
                                    ? "border border-white/20 text-white hover:bg-white/10"
                                    : "border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                                }`}
                              >
                                削除
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}

            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <div className="mb-3">
                <h2 className="text-xl font-bold">最後の操作</h2>
                <p className="text-sm text-neutral-500">
                  下からでも同じ順番で進められるようにしてる
                </p>
              </div>
              <ActionButtons />
            </section>
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
                <h2 className="text-lg font-bold">🛒 発注一覧</h2>
                <button
                  type="button"
                  onClick={handleMailTo}
                  disabled={mustSaveBeforeMail}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold text-white transition ${
                    mustSaveBeforeMail
                      ? "cursor-not-allowed bg-neutral-300"
                      : "bg-neutral-900 hover:opacity-90"
                  }`}
                >
                  メールする
                </button>
              </div>

              <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {selectedItems.length === 0 ? (
                  <p className="text-sm text-neutral-500">いまのところ候補なし</p>
                ) : (
                  groupedSelectedItems.map((group) => (
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