# ============================================================
#  U3B1 — OOP Intro Activity: RPG Guild Manager
#  Principles of Computing | Unit 03 - OOP Foundations
# ============================================================
#  In this activity, you'll build an RPG Guild Management
#  system from scratch using classes, __init__, and self.
#
#  TOTAL: 15 points (7 tasks)
#
#  HOW TO TEST: Run your file after each task. Compare your
#  output to the expected output shown in the comments.
#  Your output should match EXACTLY.
# ============================================================


# ============================================================
# TASK 1: Create the Hero class (2 pts)
# ============================================================
# Define a class called Hero with an __init__ that takes:
#   Parameters: name, role, level, hp
#   Default attributes:
#     - xp = 0
#     - is_alive = True
#
# Then create these 4 heroes and print each one's info:
#   - "Aria",    "Mage",     5,  80
#   - "Kael",    "Warrior",  7,  150
#   - "Mira",    "Healer",   4,  90
#   - "Dax",     "Rogue",    6,  100
#
# Print format for each: "name (role) — Lv.level | HP: hp | XP: xp"

print("=" * 55)
print("TASK 1: Heroes")
print("=" * 55)

# YOUR CODE HERE




# Expected Output:
# =======================================================
# TASK 1: Heroes
# =======================================================
# Aria (Mage) — Lv.5 | HP: 80 | XP: 0
# Kael (Warrior) — Lv.7 | HP: 150 | XP: 0
# Mira (Healer) — Lv.4 | HP: 90 | XP: 0
# Dax (Rogue) — Lv.6 | HP: 100 | XP: 0


# ============================================================
# TASK 2: Create the Weapon class (2 pts)
# ============================================================
# Define a class called Weapon with an __init__ that takes:
#   Parameters: name, damage, weapon_type
#   Default attributes:
#     - is_enchanted = False
#     - enchant_level = 0
#
# Then create these 4 weapons and print each one's info:
#   - "Flame Sword",    45, "Melee"
#   - "Frost Staff",    60, "Magic"
#   - "Shadow Dagger",  35, "Melee"
#   - "Thunder Bow",    50, "Ranged"
#
# Print format: "name (weapon_type) — damage DMG | Enchanted: is_enchanted"

print("\n" + "=" * 55)
print("TASK 2: Weapons")
print("=" * 55)

# YOUR CODE HERE




# Expected Output:
# =======================================================
# TASK 2: Weapons
# =======================================================
# Flame Sword (Melee) — 45 DMG | Enchanted: False
# Frost Staff (Magic) — 60 DMG | Enchanted: False
# Shadow Dagger (Melee) — 35 DMG | Enchanted: False
# Thunder Bow (Ranged) — 50 DMG | Enchanted: False


# ============================================================
# TASK 3: Create the Potion class (2 pts)
# ============================================================
# Define a class called Potion with an __init__ that takes:
#   Parameters: name, effect, potency
#   Default attributes:
#     - quantity = 1
#
# Create these 3 potions:
#   - "Elixir of Life",   "heal",   50
#   - "Mana Surge",       "mana",   30
#   - "Berserk Brew",     "attack", 20
#
# After creating them, set the Elixir's quantity to 3
# and the Mana Surge's quantity to 5.
#
# Print format: "name (xquantity) — effect +potency"

print("\n" + "=" * 55)
print("TASK 3: Potions")
print("=" * 55)

# YOUR CODE HERE




# Expected Output:
# =======================================================
# TASK 3: Potions
# =======================================================
# Elixir of Life (x3) — heal +50
# Mana Surge (x5) — mana +30
# Berserk Brew (x1) — attack +20


# ============================================================
# TASK 4: Party Roster — Objects in Lists (2 pts)
# ============================================================
# Using the 4 heroes you created in Task 1:
#
# a) Store all 4 heroes in a list called 'party'
#
# b) Loop through the party and print each hero
#    Format: "  [number] name — role (Lv.level)"
#    Number starts at 1
#
# c) Find and print the hero with the HIGHEST hp
#    Format: "Tank: name with hp HP"
#
# d) Calculate and print the total HP of the entire party
#    Format: "Total Party HP: total"

print("\n" + "=" * 55)
print("TASK 4: Party Roster")
print("=" * 55)

# YOUR CODE HERE




 Mira 100 HP | Dax 110 HP
