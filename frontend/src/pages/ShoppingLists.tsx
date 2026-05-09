import { useState, useEffect } from 'react';
import client from '../api/client';
import { Trash2, Plus } from 'lucide-react';

interface Item {
  id: string;
  name: string;
  category: string;
  unit: string;
  houseId: string;
}

interface ShoppingListItem {
  id: string;
  listId: string;
  itemId: string;
  quantity: number;
  unitOverride: string | null;
  note: string | null;
  isChecked: boolean;
  checkedById: string | null;
  item: Item;
}

interface ShoppingList {
  id: string;
  title: string;
  houseId: string;
  items: ShoppingListItem[];
}

const ShoppingLists = () => {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [newListTitle, setNewListTitle] = useState('');
  const [creatingList, setCreatingList] = useState(false);
  const [addForm, setAddForm] = useState<Record<string, { itemId: string; quantity: string }>>({});
  const [isAddingItem, setIsAddingItem] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [listsRes, itemsRes] = await Promise.all([
        client.get('/shopping-lists'),
        client.get('/items'),
      ]);
      setLists(listsRes.data);
      setItems(itemsRes.data);
    } catch {
      alert('Failed to load shopping data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    setCreatingList(true);
    try {
      const res = await client.post('/shopping-lists', { title: newListTitle });
      setLists((prev) => [res.data, ...prev]);
      setNewListTitle('');
    } catch {
      alert('Failed to create list');
    } finally {
      setCreatingList(false);
    }
  };

  const getAddForm = (listId: string) => addForm[listId] || { itemId: '', quantity: '' };

  const handleAddItem = async (listId: string) => {
    if (isAddingItem[listId]) return;

    const { itemId, quantity } = getAddForm(listId);
    if (!itemId || !quantity) return;

    const qtyNum = parseFloat(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) return;

    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticItem: ShoppingListItem = {
      id: tempId,
      listId,
      itemId,
      quantity: qtyNum,
      unitOverride: null,
      note: null,
      isChecked: false,
      checkedById: null,
      item,
    };

    setIsAddingItem((prev) => ({ ...prev, [listId]: true }));
    setLists((prev) =>
      prev.map((list) =>
        list.id === listId
          ? { ...list, items: [...list.items, optimisticItem] }
          : list
      )
    );
    setAddForm((prev) => ({ ...prev, [listId]: { itemId: '', quantity: '' } }));

    try {
      const res = await client.post(`/shopping-lists/${listId}/items`, {
        itemId,
        quantity: qtyNum,
      });
      setLists((prev) =>
        prev.map((list) =>
          list.id === listId
            ? {
                ...list,
                items: list.items.map((li) => (li.id === tempId ? res.data : li)),
              }
            : list
        )
      );
    } catch {
      setLists((prev) =>
        prev.map((list) =>
          list.id === listId
            ? { ...list, items: list.items.filter((li) => li.id !== tempId) }
            : list
        )
      );
      alert('Failed to add item');
    } finally {
      setIsAddingItem((prev) => ({ ...prev, [listId]: false }));
    }
  };

  const handleCheckItem = async (listId: string, lineId: string, currentChecked: boolean) => {
    const nextChecked = !currentChecked;

    setLists((prev) =>
      prev.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: list.items.map((li) =>
                li.id === lineId ? { ...li, isChecked: nextChecked } : li
              ),
            }
          : list
      )
    );

    try {
      const res = await client.patch(`/shopping-lists/${listId}/items/${lineId}/check`, {
        isChecked: nextChecked,
      });
      setLists((prev) =>
        prev.map((list) =>
          list.id === listId
            ? {
                ...list,
                items: list.items.map((li) => (li.id === lineId ? res.data : li)),
              }
            : list
        )
      );
    } catch {
      setLists((prev) =>
        prev.map((list) =>
          list.id === listId
            ? {
                ...list,
                items: list.items.map((li) =>
                  li.id === lineId ? { ...li, isChecked: currentChecked } : li
                ),
              }
            : list
        )
      );
      alert('Failed to update item');
    }
  };

  const handleDeleteItem = async (listId: string, lineId: string) => {
    const list = lists.find((l) => l.id === listId);
    const itemToRestore = list?.items.find((li) => li.id === lineId);
    if (!itemToRestore) return;

    setLists((prev) =>
      prev.map((list) =>
        list.id === listId
          ? { ...list, items: list.items.filter((li) => li.id !== lineId) }
          : list
      )
    );

    try {
      await client.delete(`/shopping-lists/${listId}/items/${lineId}`);
    } catch {
      setLists((prev) =>
        prev.map((list) =>
          list.id === listId
            ? { ...list, items: [...list.items, itemToRestore] }
            : list
        )
      );
      alert('Failed to delete item');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shopping Lists</h1>

      <form
        onSubmit={handleCreateList}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex gap-4"
      >
        <input
          type="text"
          value={newListTitle}
          onChange={(e) => setNewListTitle(e.target.value)}
          placeholder="New list name"
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
        />
        <button
          type="submit"
          disabled={creatingList}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2"
        >
          <Plus size={18} />
          {creatingList ? 'Creating...' : 'Create List'}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lists.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 col-span-full">
            No shopping lists yet. Create one above!
          </p>
        ) : (
          lists.map((list) => (
            <div
              key={list.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm space-y-4"
            >
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {list.title}
              </h2>

              <div className="space-y-2">
                {list.items.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500">No items yet.</p>
                ) : (
                  list.items.map((li) => (
                    <div
                      key={li.id}
                      className={`flex items-center gap-3 p-2 rounded-md ${
                        li.isChecked ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={li.isChecked}
                        onChange={() => handleCheckItem(list.id, li.id, li.isChecked)}
                        className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                      />
                      <span
                        className={`flex-1 text-sm ${
                          li.isChecked
                            ? 'line-through text-gray-400 dark:text-gray-500'
                            : 'text-gray-700 dark:text-gray-200'
                        }`}
                      >
                        {li.item.name} — {li.quantity} {li.unitOverride || li.item.unit}
                      </span>
                      <button
                        onClick={() => handleDeleteItem(list.id, li.id)}
                        className="text-gray-400 hover:text-red-500 transition"
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                {items.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Your pantry is empty. Add items to your house first.
                  </p>
                ) : (
                  <div className="flex gap-2">
                    <select
                      value={getAddForm(list.id).itemId}
                      onChange={(e) =>
                        setAddForm((prev) => ({
                          ...prev,
                          [list.id]: { ...getAddForm(list.id), itemId: e.target.value },
                        }))
                      }
                      className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Select item...</option>
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.unit})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      value={getAddForm(list.id).quantity}
                      onChange={(e) =>
                        setAddForm((prev) => ({
                          ...prev,
                          [list.id]: { ...getAddForm(list.id), quantity: e.target.value },
                        }))
                      }
                      placeholder="Qty"
                      className="w-24 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button
                      onClick={() => handleAddItem(list.id)}
                      disabled={isAddingItem[list.id]}
                      className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition disabled:opacity-50"
                      title="Add item"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ShoppingLists;
