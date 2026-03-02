# ============================================================
#  U3B3 — Sprites in Action: Mini Exercises
#  Principles of Computing | Unit 03 - OOP Foundations
# ============================================================
#  In this activity, you'll build a mini RPG arena using
#  Pygame sprites, inheritance, super(), update(), and
#  sprite groups — the exact same patterns you'll use
#  in Monster Wrangler starting next class!
#
#  TOTAL: 15 points (3 graded tasks + 1 provided)
#
#  FOCUS: The Pygame-specific code is provided for you in
#  Tasks 1–2. Your job is to build the OOP STRUCTURE:
#  classes, inheritance, super(), attributes, and groups.
#  Task 3 is fully built for you — study it!
#  Task 4 is the Boss Challenge — you write everything.
#
#  HOW TO TEST: Run your file after each task. You should
#  see your sprites appear and behave as described.
# ============================================================

import pygame
import random

# Initialize Pygame
pygame.init()

# ============================================================
# GAME CONSTANTS (DO NOT MODIFY)
# ============================================================
WINDOW_WIDTH = 800
WINDOW_HEIGHT = 600
FPS = 60

# Colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (220, 50, 50)
GREEN = (50, 200, 50)
BLUE = (50, 100, 220)
YELLOW = (255, 215, 0)
PURPLE = (150, 50, 200)
DARK_BG = (15, 15, 35)
HUD_BG = (25, 25, 55)

# Set up the display
display_surface = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
pygame.display.set_caption("U3B3 — Sprites in Action: RPG Arena")
clock = pygame.time.Clock()


# ============================================================
# TASK 1: Create the Player Sprite (4 pts)
# ============================================================
# TODO: Define the Player class
#   - It must INHERIT from pygame.sprite.Sprite
#   - __init__ takes self, x, y
#   - Call super().__init__() FIRST
#   - Then set up these attributes (Pygame code provided below):
#
#       self.image = pygame.Surface((40, 40))
#       self.image.fill(BLUE)
#       self.rect = self.image.get_rect()
#       self.rect.center = (x, y)
#       self.velocity = 5
#
#   - Define an update(self) method with this movement code:
#
#       keys = pygame.key.get_pressed()
#       if keys[pygame.K_LEFT]:
#           self.rect.x -= self.velocity
#       if keys[pygame.K_RIGHT]:
#           self.rect.x += self.velocity
#       if keys[pygame.K_UP]:
#           self.rect.y -= self.velocity
#       if keys[pygame.K_DOWN]:
#           self.rect.y += self.velocity
#
#       # Keep player in bounds
#       self.rect.left = max(0, self.rect.left)
#       self.rect.right = min(WINDOW_WIDTH, self.rect.right)
#       self.rect.top = max(100, self.rect.top)
#       self.rect.bottom = min(WINDOW_HEIGHT, self.rect.bottom)
#
# YOUR OOP STRUCTURE:
#   1. Write the class definition line (with inheritance)
#   2. Write __init__ with super().__init__()
#   3. Copy the attribute code above into __init__
#   4. Write the update method and copy the movement code into it
#
# ✅ CHECKPOINT: Blue square moves with arrow keys, stays in bounds.
# ============================================================

# YOUR CODE HERE — Define the Player class




# ============================================================
# TASK 2: Monster Sprite + Sprite Groups (5 pts)
# ============================================================
# PART A — TODO: Define the Monster class
#   - It must INHERIT from pygame.sprite.Sprite
#   - __init__ takes only self (no x, y — it picks randomly)
#   - Call super().__init__() FIRST
#   - Then set up these attributes (Pygame code provided):
#
#       self.image = pygame.Surface((30, 30))
#       self.image.fill(RED)
#       self.rect = self.image.get_rect()
#       self.rect.x = random.randint(0, WINDOW_WIDTH - 30)
#       self.rect.y = random.randint(100, WINDOW_HEIGHT - 30)
#       self.dx = random.choice([-3, -2, 2, 3])
#       self.dy = random.choice([-3, -2, 2, 3])
#
#   - Define an update(self) method with this bouncing code:
#
#       self.rect.x += self.dx
#       self.rect.y += self.dy
#
#       if self.rect.left <= 0 or self.rect.right >= WINDOW_WIDTH:
#           self.dx *= -1
#       if self.rect.top <= 100 or self.rect.bottom >= WINDOW_HEIGHT:
#           self.dy *= -1
#
# YOUR OOP STRUCTURE:
#   1. Write the class definition line (with inheritance)
#   2. Write __init__ with super().__init__()
#   3. Copy the attribute code into __init__
#   4. Write the update method and copy the bouncing code into it

# YOUR CODE HERE — Define the Monster class



# -------------------------------------------------------
# PART B — TODO: Create Sprite Groups
#   - Create a Player at center of the screen
#   - Create a player_group (pygame.sprite.Group()) and add the player
#   - Create a monster_group (pygame.sprite.Group())
#   - Use a for loop to create 5 Monster objects and add each to monster_group
#
# HINT — here's how groups work:
#   my_group = pygame.sprite.Group()
#   my_group.add(some_sprite)

# YOUR CODE HERE — Create player, groups, and 5 monsters




# ✅ CHECKPOINT: Blue player + 5 red monsters bouncing around.


# ============================================================
# TASK 3: Collision Detection + HUD (4 pts) — PROVIDED
# ============================================================
# Study this code! You'll need these same patterns for Task 4.
# Notice how draw_hud() uses global variables and renders text.

# Game state variables
score = 0
lives = 3
game_over = False
font = pygame.font.Font(None, 36)


def draw_hud():
    """Draw the heads-up display bar at the top of the screen."""
    # HUD background
    pygame.draw.rect(display_surface, HUD_BG, (0, 0, WINDOW_WIDTH, 90))
    pygame.draw.line(display_surface, PURPLE, (0, 90), (WINDOW_WIDTH, 90), 2)

    # Score (top-left)
    score_text = font.render("Score: " + str(score), True, WHITE)
    display_surface.blit(score_text, (20, 20))

    # Lives (bottom-left)
    lives_text = font.render("Lives: " + str(lives), True, RED)
    display_surface.blit(lives_text, (20, 50))

    # Monster count (top-right)
    monster_text = font.render("Monsters: " + str(len(monster_group)), True, YELLOW)
    display_surface.blit(monster_text, (WINDOW_WIDTH - 200, 20))


# ============================================================
# TASK 4: Gem Collectibles — BOSS CHALLENGE (6 pts)
# ============================================================
# NOW IT'S YOUR TURN — no Pygame code provided!
#
# Create a class called Gem that inherits from pygame.sprite.Sprite.
#   - __init__(self):
#       - Call the parent constructor
#       - Create a 20x20 image filled with YELLOW
#       - Set up the rect
#       - Place it at a random x (0 to WINDOW_WIDTH - 20)
#       - Place it at a random y (100 to WINDOW_HEIGHT - 20)
#
#   - Gems don't need an update() method — they just sit still.
#
# Then:
#   - Create a gem_group sprite group
#   - Use a loop to add 8 Gem objects to it
#
# Finally, update your draw_hud() function to also show at
#   position (WINDOW_WIDTH - 200, 50):
#   "Gems Left: {len(gem_group)}"  using GREEN
#
# ✅ CHECKPOINT: Yellow gems appear. Collecting them adds 10 pts.
#    Monsters still hurt. Full mini-game is playable!
# ============================================================

# YOUR CODE HERE — Define the Gem class, create gem_group, add 8 gems




# ============================================================
# GAME LOOP (DO NOT MODIFY — but read through it!)
# ============================================================
# This is the same game loop pattern you'll use in Monster Wrangler.
# The loop: handles events → updates → draws → flips display.

running = True
while running:
    # ---- EVENT HANDLING ----
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_r and game_over:
                # Reset the game
                score = 0
                lives = 3
                game_over = False
                player.rect.center = (WINDOW_WIDTH // 2, WINDOW_HEIGHT // 2)
                # Repopulate monsters
                monster_group.empty()
                for i in range(5):
                    monster_group.add(Monster())
                # Repopulate gems (only if Task 4 is done)
                try:
                    gem_group.empty()
                    for i in range(8):
                        gem_group.add(Gem())
                except NameError:
                    pass

    if not game_over:
        # ---- UPDATE ----
        player_group.update()
        monster_group.update()

        # Collision: player vs monsters
        try:
            collided_monster = pygame.sprite.spritecollideany(player, monster_group)
            if collided_monster:
                collided_monster.kill()
                lives -= 1
                if lives <= 0:
                    game_over = True
        except NameError:
            pass

        # Collision: player vs gems (Task 4)
        try:
            collided_gem = pygame.sprite.spritecollideany(player, gem_group)
            if collided_gem:
                collided_gem.kill()
                score += 10
        except NameError:
            pass

    # ---- DRAW ----
    display_surface.fill(DARK_BG)

    # Draw grid lines for arena feel
    for x in range(0, WINDOW_WIDTH, 50):
        pygame.draw.line(display_surface, (25, 25, 50), (x, 100), (x, WINDOW_HEIGHT), 1)
    for y in range(100, WINDOW_HEIGHT, 50):
        pygame.draw.line(display_surface, (25, 25, 50), (0, y), (WINDOW_WIDTH, y), 1)

    # Draw sprites
    try:
        gem_group.draw(display_surface)
    except NameError:
        pass
    monster_group.draw(display_surface)
    player_group.draw(display_surface)

    # Draw HUD
    try:
        draw_hud()
    except (NameError, TypeError):
        pygame.draw.rect(display_surface, HUD_BG, (0, 0, WINDOW_WIDTH, 90))
        pygame.draw.line(display_surface, PURPLE, (0, 90), (WINDOW_WIDTH, 90), 2)

    # Game over overlay
    if game_over:
        overlay = pygame.Surface((WINDOW_WIDTH, WINDOW_HEIGHT))
        overlay.set_alpha(180)
        overlay.fill(BLACK)
        display_surface.blit(overlay, (0, 0))
        go_font = pygame.font.Font(None, 72)
        go_text = go_font.render("GAME OVER", True, RED)
        go_rect = go_text.get_rect(center=(WINDOW_WIDTH // 2, WINDOW_HEIGHT // 2 - 30))
        display_surface.blit(go_text, go_rect)
        try:
            score_text = go_font.render("Score: " + str(score), True, YELLOW)
            score_rect = score_text.get_rect(center=(WINDOW_WIDTH // 2, WINDOW_HEIGHT // 2 + 40))
            display_surface.blit(score_text, score_rect)
        except NameError:
            pass
        restart_font = pygame.font.Font(None, 36)
        restart_text = restart_font.render("Press R to Restart", True, WHITE)
        restart_rect = restart_text.get_rect(center=(WINDOW_WIDTH // 2, WINDOW_HEIGHT // 2 + 100))
        display_surface.blit(restart_text, restart_rect)

    # ---- FLIP ----
    pygame.display.update()
    clock.tick(FPS)

pygame.quit()
