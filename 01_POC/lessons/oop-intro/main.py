# ============================================================
#  U3B1 — OOP Intro: Classes, __init__, self
#  Guided Notes — Starter File
#  Principles of Computing | Unit 03 - OOP Foundations
# ============================================================
#  Instructions:
#    - Follow along with the guided notes
#    - Complete each TODO as we reach that section
#    - Run your file after each section to test!
# ============================================================


# ============================================================
# SECTION 1: What is OOP?
# ============================================================
# OOP = Object-Oriented Programming
# Instead of just writing functions and variables floating around,
# we organize our code into CLASSES (blueprints) and OBJECTS (real things).
#
# Think of it like a video game:
#   - The CHARACTER CREATION SCREEN is the CLASS (blueprint)
#   - Each CHARACTER you make is an OBJECT (instance)

print("=" * 50)
print("SECTION 1: What is OOP?")
print("=" * 50)

# We've been using objects all along!
my_list = [1, 2, 3]        # my_list is an OBJECT of type 'list'
my_string = "Hello World"   # my_string is an OBJECT of type 'str'
print(type(my_list))        # <class 'list'>
print(type(my_string))      # <class 'str'>

# Now we'll learn to make our OWN classes!


# ============================================================
# SECTION 2: Defining a Class
# ============================================================
print("\n" + "=" * 50)
print("SECTION 2: Defining a Class")
print("=" * 50)

# The simplest possible class:
class Hero:
    """A brave RPG hero character."""
    pass  # placeholder — we'll fill this in next!

# We can already create an object from it:
hero_1 = Hero()
print(type(hero_1))   # <class '__main__.Hero'>

# TODO 1: Define a class called Weapon with a docstring and pass
# Then create an object called sword from it and print its type



# ============================================================
# SECTION 3: The __init__ Constructor
# ============================================================
print("\n" + "=" * 50)
print("SECTION 3: The __init__ Constructor")
print("=" * 50)

# __init__ runs automatically when you create an object
# It sets up the starting values (attributes)

class Hero:
    """A brave RPG hero character."""

    def __init__(self, name, health, attack_power):
        self.name = name
        self.health = health
        self.attack_power = attack_power
        self.is_alive = True    # default value — same for every hero

# Now we MUST provide the arguments when creating:
aria = Hero("Aria", 100, 25)
print(f"Created hero: {aria.name}")
print(f"Health: {aria.health}")
print(f"Attack: {aria.attack_power}")
print(f"Alive: {aria.is_alive}")

# TODO 2: Create a hero named "Kael" with 120 health and 30 attack power
# Print out all of Kael's attributes using f-strings



# ============================================================
# SECTION 4: The self Keyword
# ============================================================
print("\n" + "=" * 50)
print("SECTION 4: The self Keyword")
print("=" * 50)

# "self" means "this specific object I'm working with"
# When we write:   aria = Hero("Aria", 100, 25)
# Python does:     Hero.__init__(aria, "Aria", 100, 25)
#                                 ^--- self = aria!

# Proof that each object is separate:
hero_a = Hero("Aria", 100, 25)
hero_b = Hero("Kael", 120, 30)

print(f"hero_a.name = {hero_a.name}")    # "Aria"
print(f"hero_b.name = {hero_b.name}")    # "Kael"

# Changing one doesn't affect the other:
hero_a.health = 50  # Aria took damage!
print(f"hero_a.health = {hero_a.health}")  # 50
print(f"hero_b.health = {hero_b.health}")  # still 120!

# TODO 3: Create TWO Weapon objects:
#   - sword: "Iron Sword", damage 15, weight 5
#   - staff: "Oak Staff", damage 25, weight 3
# Print each weapon's name and damage
# Then change the sword's damage to 20 and print both damages again
# to prove they're independent

class Weapon:
    """An RPG weapon with damage and weight stats."""

    def __init__(self, name, damage, weight):
        self.name = name
        self.damage = damage
        self.weight = weight



# ============================================================
# SECTION 5: Instance Attributes
# ============================================================
print("\n" + "=" * 50)
print("SECTION 5: Instance Attributes")
print("=" * 50)

# Two kinds of attributes:
# 1) From parameters — values passed in by the user
# 2) Default values — set inside __init__, same starting value for all

class Monster:
    """An enemy monster in our RPG."""

    def __init__(self, name, monster_type, max_health):
        # From parameters:
        self.name = name
        self.monster_type = monster_type
        self.max_health = max_health

        # Default values:
        self.current_health = max_health  # starts at full HP!
        self.level = 1
        self.is_defeated = False
        self.loot = []                    # empty list — loot TBD

goblin = Monster("Grimjaw", "Goblin", 50)
print(f"{goblin.name} the {goblin.monster_type}")
print(f"  HP: {goblin.current_health}/{goblin.max_health}")
print(f"  Level: {goblin.level}")
print(f"  Defeated: {goblin.is_defeated}")
print(f"  Loot: {goblin.loot}")

# TODO 4: Define a class called Potion with __init__ that takes:
#   - name (from parameter)
#   - heal_amount (from parameter)
#   - Set a default attribute: is_used = False
# Create two potions:
#   - "Health Potion" that heals 30
#   - "Super Potion" that heals 75
# Print each potion's name, heal amount, and is_used status


# ── Leg Stretch / Q&A ──


# ============================================================
# SECTION 6: Creating & Using Objects
# ============================================================
print("\n" + "=" * 50)
print("SECTION 6: Creating & Using Objects")
print("=" * 50)

# You can read and write attributes with dot notation:
dragon = Monster("Smaug", "Dragon", 500)

# READ attributes:
print(f"Name: {dragon.name}")
print(f"HP: {dragon.current_health}")

# WRITE (modify) attributes:
dragon.current_health -= 100
print(f"After attack: {dragon.current_health} HP")

dragon.loot.append("Dragon Scale")
dragon.loot.append("Gold x500")
print(f"Loot: {dragon.loot}")

# Check with a conditional:
if dragon.current_health <= 0:
    dragon.is_defeated = True
    print(f"{dragon.name} has been defeated!")
else:
    print(f"{dragon.name} still has {dragon.current_health} HP remaining!")

# TODO 5: Create a Monster named "Shadow Wolf" of type "Beast" with 80 max HP
# Then simulate a battle:
#   - Deal 35 damage (subtract from current_health)
#   - Print the wolf's current HP
#   - Deal another 50 damage
#   - Check if current_health <= 0
#     - If yes: set is_defeated to True and add "Wolf Pelt" to loot
#     - If no: print remaining HP
#   - Print the wolf's is_defeated status and loot



# ============================================================
# SECTION 7: Objects in Collections & Loops
# ============================================================
print("\n" + "=" * 50)
print("SECTION 7: Objects in Collections & Loops")
print("=" * 50)

# Objects can go in lists — this is HUGE for games!
party = [
    Hero("Aria", 100, 25),
    Hero("Kael", 120, 30),
    Hero("Mira", 70, 50),
]

# Loop through and print each hero:
print("=== YOUR PARTY ===")
for hero in party:
    print(f"  {hero.name}: {hero.health} HP, {hero.attack_power} ATK")

# Find the strongest attacker:
strongest = party[0]
for hero in party:
    if hero.attack_power > strongest.attack_power:
        strongest = hero
print(f"\nStrongest attacker: {strongest.name} ({strongest.attack_power} ATK)")

# Calculate total party health:
total_hp = 0
for hero in party:
    total_hp += hero.health
print(f"Total party HP: {total_hp}")

# TODO 6: Create a list called 'enemies' containing 3 Monster objects:
#   - "Goblin", type "Goblin", 50 HP
#   - "Skeleton", type "Undead", 40 HP
#   - "Troll", type "Giant", 150 HP
# Then:
#   a) Loop through and print each enemy's name and HP
#   b) Find and print the enemy with the MOST health
#   c) Calculate and print the total HP of all enemies



# ============================================================
# EXIT TICKET
# ============================================================
print("\n" + "=" * 50)
print("EXIT TICKET")
print("=" * 50)

# TODO 7 (EXIT TICKET): Build a complete class from scratch!
#
# Create a class called QuestItem with:
#   Parameters: name, rarity, value
#   Default attributes: is_equipped = False, enhancement_level = 0
#
# Then:
#   a) Create 3 QuestItem objects and store them in a list called 'inventory'
#      - "Phoenix Feather", rarity "Legendary", value 500
#      - "Iron Shield", rarity "Common", value 25
#      - "Shadow Cloak", rarity "Rare", value 150
#
#   b) Loop through inventory and print each item's name and rarity
#
#   c) "Equip" the Shadow Cloak (set is_equipped to True)
#
#   d) "Enhance" the Iron Shield 3 times (add 3 to enhancement_level)
#
#   e) Calculate and print the total value of all items in inventory
#
#   f) Print the enhanced shield's info:
#      "Iron Shield +3 (Common) — Value: 25"


