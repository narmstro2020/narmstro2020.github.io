# ============================================
# player.py — Player Stats & Equipment
# ============================================
# Manages the player dictionary: name, stats,
# gold, and equipped items.
# ============================================


def create_player():
    """Create and return a player dictionary from user input."""

    # TODO: Ask the user for their character name using input()
    # TODO: Ask the user for their character class using input()
    #       (e.g., "Warrior", "Mage", "Rogue")

    # TODO: Create and return a dictionary called "player" with:
    #   "name"      → the name they entered
    #   "class"     → the class they entered
    #   "level"     → 1
    #   "health"    → 100
    #   "attack"    → 15
    #   "defense"   → 10
    #   "gold"      → 100
    #   "equipped"  → {"weapon": "Wooden Sword", "armor": "Cloth Tunic"}
    #
    # Print: "⚔️ Welcome, {name} the {class}!"
    # Return the player dictionary

    pass  # Remove this when you add your code


def show_player_stats(player):
    """Display all player stats in a formatted way."""

    # TODO: Print the player's stats using the player dictionary
    # It should look like this:
    #
    # 📋 PLAYER STATS
    #   Name: Aria
    #   Class: Mage
    #   Level: 1
    #   Health: 100
    #   Attack: 15
    #   Defense: 10
    #   Gold: 100 💰
    #   Equipped Weapon: Wooden Sword
    #   Equipped Armor: Cloth Tunic
    #
    # Hint: player["equipped"] is a nested dictionary
    #       Access with player["equipped"]["weapon"]

    pass  # Remove this when you add your code


def equip_item(inventory, player):
    """Let the player equip a weapon or armor from inventory."""

    # TODO: Ask the user if they want to equip a "weapon" or "armor"
    # TODO: Check if that category exists in the inventory dict
    #       and has at least one item in its list
    # TODO: If yes:
    #       - Show the available items in that category
    #       - Ask which item to equip (by name)
    #       - Update player["equipped"]["weapon"] or player["equipped"]["armor"]
    #       - Print: "✅ Equipped {item}!"
    # TODO: If no items in that category:
    #       - Print: "❌ No items available in that category."
    #
    # Hint: inventory["weapons"] is a list of dictionaries
    #       Each has a "name" key you can check against

    pass  # Remove this when you add your code
