# ============================================================
#  U3B3 — OOP Part 2: Methods, Sprites & super()
#  Guided Notes — Starter File
#  Principles of Computing | Unit 03 - OOP Foundations
# ============================================================
#  Instructions:
#    - Follow along with the guided notes
#    - Complete each TODO as we reach that section
#    - Run your file after each section to test!
# ============================================================


# ============================================================
# SECTION 1: What Are Methods?
# ============================================================
# In U3B1 we learned about ATTRIBUTES (data an object HAS).
# Now we add METHODS — actions an object CAN DO.
# A method is just a function defined INSIDE a class.

print("=" * 50)
print("SECTION 1: What Are Methods?")
print("=" * 50)

# Quick review — attributes only:
class Hero:
    """A brave RPG hero."""
    def __init__(self, name, hp):
        self.name = name
        self.hp = hp
        self.level = 1

hero = Hero("Aria", 100)
print(f"{hero.name} has {hero.hp} HP (level {hero.level})")
# Aria has 100 HP (level 1)

# But our hero can't DO anything yet!
# Methods give objects the ability to perform actions.


# ============================================================
# SECTION 2: Defining Instance Methods
# ============================================================
print("\n" + "=" * 50)
print("SECTION 2: Defining Instance Methods")
print("=" * 50)

# A method is defined with 'def' INSIDE the class.
# It ALWAYS takes 'self' as the first parameter.

class Hero:
    """A brave RPG hero."""
    def __init__(self, name, hp):
        self.name = name
        self.hp = hp
        self.level = 1

    # This is an instance method:
    def attack(self):
        print(f"{self.name} swings their sword!")

    def war_cry(self):
        print(f"{self.name} shouts: 'For glory!'")

hero = Hero("Aria", 100)
hero.attack()     # Aria swings their sword!
hero.war_cry()    # Aria shouts: 'For glory!'

# TODO 1: Add a method called 'introduce' to the Weapon class below.
#         It should print: "{name} — Damage: {damage}"
#         Then create a sword object and call introduce() on it.

class Weapon:
    """An RPG weapon."""
    def __init__(self, name, damage):
        self.name = name
        self.damage = damage

    # YOUR METHOD HERE


# Create a Weapon and call introduce():


# Expected output:  Iron Sword — Damage: 25


# ============================================================
# SECTION 3: Methods with Parameters & Return Values
# ============================================================
print("\n" + "=" * 50)
print("SECTION 3: Methods with Parameters & Return")
print("=" * 50)

# Methods can take extra parameters (besides self)
# and they can return values.

class Hero:
    """A brave RPG hero."""
    def __init__(self, name, hp):
        self.name = name
        self.hp = hp
        self.level = 1

    # Method WITH a parameter:
    def take_damage(self, amount):
        self.hp -= amount
        print(f"{self.name} took {amount} damage! HP: {self.hp}")

    # Method WITH a return value:
    def is_alive(self):
        return self.hp > 0

    # Method that MODIFIES state:
    def level_up(self):
        self.level += 1
        self.hp += 20
        print(f"{self.name} leveled up to {self.level}! HP: {self.hp}")

hero = Hero("Aria", 100)
hero.take_damage(30)       # Aria took 30 damage! HP: 70
print(hero.is_alive())     # True
hero.level_up()            # Aria leveled up to 2! HP: 90

# TODO 2: Add two methods to the Monster class below:
#   a) 'roar' — takes no extra params, prints "{name} roars!"
#   b) 'take_hit' — takes 'damage' param, subtracts from hp,
#       prints "{name} has {hp} HP remaining!"
#       Returns True if hp > 0, False otherwise.
# Then create a goblin and test both methods.

class Monster:
    """A fearsome RPG monster."""
    def __init__(self, name, hp):
        self.name = name
        self.hp = hp

    # YOUR METHODS HERE


# Create a Monster and test:


# Expected output:
#   Goblin roars!
#   Goblin has 20 HP remaining!
#   True


# ============================================================
# SECTION 4: Inheritance Basics
# ============================================================
print("\n" + "=" * 50)
print("SECTION 4: Inheritance Basics")
print("=" * 50)

# Inheritance lets one class (child) get everything
# from another class (parent), then add its own stuff.

# Parent class:
class Character:
    """Base class for all RPG characters."""
    def __init__(self, name, hp):
        self.name = name
        self.hp = hp

    def get_info(self):
        return f"{self.name} (HP: {self.hp})"

# Child class — inherits from Character:
class Warrior(Character):
    """A strong melee fighter."""
    def __init__(self, name, hp, strength):
        self.name = name       # same as parent
        self.hp = hp           # same as parent
        self.strength = strength  # NEW attribute!

    def slash(self):
        print(f"{self.name} slashes for {self.strength} damage!")

w = Warrior("Thorin", 120, 85)
print(w.get_info())  # Thorin (HP: 120) — inherited from Character!
w.slash()            # Thorin slashes for 85 damage!

# TODO 3: Create a Mage class that inherits from Character.
#         Add a 'mana' attribute and a 'cast_spell' method
#         that prints "{name} casts a fireball! Mana: {mana}"
#         Then create a mage and call both get_info() and cast_spell().

# YOUR CLASS HERE


# Create and test:


# Expected output:
#   Gandalf (HP: 80)
#   Gandalf casts a fireball! Mana: 150


# ============================================================
# SECTION 5: The super() Function
# ============================================================
print("\n" + "=" * 50)
print("SECTION 5: The super() Function")
print("=" * 50)

# In Section 4 we repeated self.name and self.hp
# in the child class. That's not DRY!
# super() lets the child call the PARENT's __init__:

class Character:
    """Base class for all RPG characters."""
    def __init__(self, name, hp):
        self.name = name
        self.hp = hp

    def get_info(self):
        return f"{self.name} (HP: {self.hp})"

# BETTER version with super():
class Warrior(Character):
    """A strong melee fighter."""
    def __init__(self, name, hp, strength):
        super().__init__(name, hp)     # parent handles name & hp
        self.strength = strength       # child adds its own

    def slash(self):
        print(f"{self.name} slashes for {self.strength} damage!")

w = Warrior("Thorin", 120, 85)
print(w.get_info())  # Thorin (HP: 120)
w.slash()            # Thorin slashes for 85 damage!

# TODO 4: Rewrite your Mage class from TODO 3 using super().
#         Don't repeat self.name and self.hp — let the parent handle it.

# YOUR IMPROVED CLASS HERE


# Create and test:


# Expected output:
#   Gandalf (HP: 80)
#   Gandalf casts a fireball! Mana: 150


# ============================================================
# SECTION 6: Pygame Sprites & Groups
# ============================================================
print("\n" + "=" * 50)
print("SECTION 6: Pygame Sprites & Groups")
print("=" * 50)

# pygame.sprite.Sprite is a PARENT class provided by Pygame.
# Your game objects INHERIT from it — just like Section 4!
#
# Sprite gives you:
#   self.image  — what the sprite looks like
#   self.rect   — where it is (position & size)
#   .kill()     — remove from all groups
#   .update()   — called each frame (you override this)
#
# A Group is a container that manages multiple sprites:
#   group.update()     — calls update() on every sprite
#   group.draw(screen) — draws every sprite to the screen

# We can't run Pygame here, but here's the PATTERN:
#
# class Player(pygame.sprite.Sprite):
#     def __init__(self, x, y):
#         super().__init__()       # set up Sprite internals
#         self.image = pygame.Surface((32, 32))
#         self.image.fill("green")
#         self.rect = self.image.get_rect(center=(x, y))
#
# # Create a group and add the player:
# all_sprites = pygame.sprite.Group()
# player = Player(400, 300)
# all_sprites.add(player)

# TODO 5: Without Pygame, let's practice the PATTERN.
#         Complete the MockSprite parent class and Player child class below.
#         Player should use super().__init__() and set x, y, speed.

class MockSprite:
    """Simulates pygame.sprite.Sprite for practice."""
    def __init__(self):
        self.alive = True

    def kill(self):
        self.alive = False
        print(f"{type(self).__name__} removed from game!")

    def update(self):
        pass  # child classes override this

# YOUR Player CLASS HERE (inherits from MockSprite):


# Create a player and test:
# player = Player(100, 200, 5)
# print(f"Player at ({player.x}, {player.y}), speed: {player.speed}")
# print(f"Alive: {player.alive}")

# Expected output:
#   Player at (100, 200), speed: 5
#   Alive: True


# ============================================================
# SECTION 7: The update() Pattern
# ============================================================
print("\n" + "=" * 50)
print("SECTION 7: The update() Pattern")
print("=" * 50)

# In Pygame, every sprite can have its own update() method.
# The game loop calls group.update() which triggers
# each sprite's update() individually.
# Different sprites can behave differently!

# TODO 6: Complete the Player and Monster classes.
#         Player.update() should move right by adding speed to x.
#         Monster.update() should move left by subtracting speed from x.
#         Then simulate 3 frames of the game loop.

class GameSprite:
    """Base sprite with position."""
    def __init__(self, name, x, y, speed):
        self.name = name
        self.x = x
        self.y = y
        self.speed = speed

    def update(self):
        pass

# YOUR Player AND Monster CLASSES HERE:


# Simulate the game loop:
# player = Player("Hero", 0, 300, 5)
# monster = Monster("Goblin", 800, 300, 3)
#
# for frame in range(1, 4):
#     print(f"--- Frame {frame} ---")
#     player.update()
#     monster.update()
#     print(f"  {player.name} at x={player.x}")
#     print(f"  {monster.name} at x={monster.x}")

# Expected output:
#   --- Frame 1 ---
#     Hero at x=5
#     Goblin at x=797
#   --- Frame 2 ---
#     Hero at x=10
#     Goblin at x=794
#   --- Frame 3 ---
#     Hero at x=15
#     Goblin at x=791


# ============================================================
# EXIT TICKET — Build a complete Sprite-style class
# ============================================================
print("\n" + "=" * 50)
print("EXIT TICKET")
print("=" * 50)

# TODO 7 (EXIT TICKET):
# Create a Projectile class that inherits from GameSprite.
# Requirements:
#   - __init__ takes name, x, y, speed, and damage
#   - Uses super().__init__() for name, x, y, speed
#   - Adds self.damage as its own attribute
#   - Has an update() method that adds speed to x (moves right)
#   - Has a hit() method that prints:
#     "{name} hits for {damage} damage at x={x}!"
#
# Create a fireball at (0, 250) with speed 10 and damage 40.
# Call update() 3 times, then call hit().

# YOUR CLASS HERE


# Expected output:
#   Fireball hits for 40 damage at x=30!


print("\n" + "=" * 50)
print("✅ All sections complete! Submit to GitHub → Canvas.")
print("=" * 50)
