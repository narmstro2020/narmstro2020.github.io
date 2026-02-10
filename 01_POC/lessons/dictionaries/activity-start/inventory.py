# ============================================
# inventory.py — Core Inventory Management
# ============================================
# Manages the inventory dictionary. The inventory
# is a dict where keys are categories (strings)
# and values are lists of item dictionaries.
#
# Structure:
# {
#     "weapons": [{"name": "Iron Sword", "damage": 20, "qty": 1}, ...],
#     "potions": [{"name": "Health Potion", "effect": "heal", "qty": 3}, ...],
#     "armor":   [{"name": "Iron Shield", "defense": 15, "qty": 1}, ...],
#     "materials": [{"name": "Wood", "qty": 10}, ...]
# }
# ============================================


def create_starter_inventory():
    """Create and return the starting inventory dictionary."""

    # TODO: Create a dictionary called "inventory" with the following structure:
    #
    # "weapons" → a list containing:
    #     {"name": "Wooden Sword", "damage": 10, "qty": 1}
    #
    # "potions" → a list containing:
    #     {"name": "Health Potion", "effect": "heal", "qty": 3}
    #     {"name": "Mana Potion", "effect": "mana", "qty": 2}
    #
    # "armor" → a list containing:
    #     {"name": "Cloth Tunic", "defense": 5, "qty": 1}
    #
    # "materials" → a list containing:
    #     {"name": "Wood", "qty": 5}
    #     {"name": "Stone", "qty": 3}
    #
    # Return the inventory dictionary

    pass  # Remove this when you add your code


def show_inventory(inventory):
    """Display all items organized by category."""

    # TODO: Print "🎒 INVENTORY"
    # TODO: Loop through each category and its items using .items()
    # TODO: For each category, print the category name in uppercase
    # TODO: For each item in that category's list, print its details
    #
    # Expected output format:
    #   🎒 INVENTORY
    #   ── WEAPONS ──
    #     Wooden Sword (Damage: 10) x1
    #   ── POTIONS ──
    #     Health Potion (Effect: heal) x3
    #     Mana Potion (Effect: mana) x2
    #   ── ARMOR ──
    #     Cloth Tunic (Defense: 5) x1
    #   ── MATERIALS ──
    #     Wood x5
    #     Stone x3
    #
    # Hint: Use .get() for keys that might not exist on all items
    #       e.g., materials don't have "damage" or "effect"
    #       item.get("damage") will return None if not present

    pass  # Remove this when you add your code


def add_item(inventory):
    """Add an item to a category, or increase qty if it exists."""

    # TODO: Ask the user which category to add to
    # TODO: Ask for the item name
    # TODO: Ask for the quantity (convert to int)
    #
    # TODO: Check if the category exists in inventory
    #       If not, create it: inventory[category] = []
    #
    # TODO: Check if an item with that name already exists in the category
    #       Loop through inventory[category] and compare item["name"]
    #       If found: increase its "qty" by the entered quantity
    #                 Print "✅ Updated {name} — now have {qty}!"
    #       If not found: append a new dict {"name": name, "qty": quantity}
    #                     Print "✅ Added {qty}x {name} to {category}!"

    pass  # Remove this when you add your code


def use_item(inventory, player):
    """Use a potion from inventory to affect player stats."""

    # TODO: Check if "potions" exists in inventory and has items
    #       If not, print "❌ No potions available!" and return
    #
    # TODO: Show available potions with their quantities
    #       Loop through inventory["potions"] and print:
    #       "  {name} x{qty}"
    #
    # TODO: Ask which potion to use (by name)
    #
    # TODO: Find the potion in the list
    #       If found and qty > 0:
    #           - Decrease qty by 1
    #           - If effect is "heal": add 25 to player["health"]
    #             Print "💚 Healed! Health: {health}"
    #           - If effect is "mana": add 15 to player["attack"] (temporary boost)
    #             Print "💙 Mana surge! Attack: {attack}"
    #           - If qty reaches 0, remove the potion from the list
    #       If not found:
    #           Print "❌ Potion not found!"

    pass  # Remove this when you add your code


def count_total_items(inventory):
    """Count the total number of items across all categories."""

    # TODO: Create a variable total = 0
    # TODO: Loop through each category's item list
    # TODO: For each item, add its "qty" to total
    # TODO: Return total
    #
    # Hint: This requires a nested loop:
    #   for category, items in inventory.items():
    #       for item in items:
    #           total += item["qty"]

    pass  # Remove this when you add your code
