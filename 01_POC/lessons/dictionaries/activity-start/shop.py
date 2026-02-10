# ============================================
# shop.py — The Item Shop
# ============================================
# The shop is a list of dictionaries. Each dict
# represents an item for sale with name, price,
# category, and stat info.
# ============================================


def create_shop():
    """Create and return the shop inventory (list of dicts)."""

    # TODO: Create a list called "shop" containing these item dictionaries:
    #
    #   {"name": "Iron Sword",      "price": 50,  "category": "weapons",   "damage": 20}
    #   {"name": "Steel Shield",    "price": 40,  "category": "armor",     "defense": 15}
    #   {"name": "Health Potion",   "price": 15,  "category": "potions",   "effect": "heal"}
    #   {"name": "Mana Potion",     "price": 20,  "category": "potions",   "effect": "mana"}
    #   {"name": "Fire Staff",      "price": 80,  "category": "weapons",   "damage": 35}
    #   {"name": "Dragon Armor",    "price": 120, "category": "armor",     "defense": 30}
    #
    # Return the shop list

    pass  # Remove this when you add your code


def show_shop(shop):
    """Display all items available in the shop."""

    # TODO: Print "🏪 SHOP"
    # TODO: Loop through each item in the shop list
    # TODO: Print each item like:
    #       "  Iron Sword — 50 gold (Damage: 20)"
    #       "  Health Potion — 15 gold (Effect: heal)"
    #       "  Steel Shield — 40 gold (Defense: 15)"
    #
    # Hint: Use .get() to handle items that might have "damage", "defense", or "effect"
    #       You can check: if item.get("damage") is not None:

    pass  # Remove this when you add your code


def buy_item(inventory, shop, player):
    """Let the player buy an item from the shop."""

    # TODO: Show the shop first (call show_shop)
    # TODO: Ask which item to buy (by name)
    #
    # TODO: Find the item in the shop list
    #       Loop through shop and compare item["name"] (case-insensitive is a bonus)
    #
    # TODO: If found:
    #       - Check if player has enough gold: player["gold"] >= item["price"]
    #       - If yes:
    #           * Subtract price from player["gold"]
    #           * Determine the category from the shop item
    #           * Check if that category exists in inventory
    #             If not, create it: inventory[category] = []
    #           * Check if player already has this item in that category
    #             If yes: increase qty by 1
    #             If no: append a new dict with the item info and qty=1
    #           * Print "✅ Bought {name} for {price} gold! (Gold remaining: {gold})"
    #       - If not enough gold:
    #           * Print "❌ Not enough gold! You need {price} but have {gold}."
    #
    # TODO: If item not found in shop:
    #       Print "❌ Item not found in shop!"

    pass  # Remove this when you add your code


def sell_item(inventory, shop, player):
    """Let the player sell an item from inventory."""

    # TODO: Ask which category to sell from
    # TODO: Check if that category exists in inventory
    #
    # TODO: If exists:
    #       - Show items in that category
    #       - Ask which item to sell (by name)
    #       - Find the item in the category list
    #       - If found and qty > 0:
    #           * Calculate sell price as half the original value (you can use 10 as default)
    #           * Decrease qty by 1
    #           * Add sell price to player["gold"]
    #           * If qty reaches 0, remove the item from the list
    #           * Print "💰 Sold {name} for {sell_price} gold! (Gold: {gold})"
    #       - If not found:
    #           Print "❌ Item not found in that category."
    #
    # TODO: If category doesn't exist:
    #       Print "❌ Category not found!"

    pass  # Remove this when you add your code
