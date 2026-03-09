"""
Monster Wrangler — Build Day 2 Additions
==========================================
📅 Monday, March 9  |  11:01 a.m. – 12:27 p.m.

HOW TO USE THIS FILE
──────────────────────────────────────────────────────────────────
 1. Open your Day 1 solution (monster_wrangler.py)
 2. ADD the Monster class (below) right before the Player class
 3. ADD the two new methods into your Game class
 4. Make the three small wiring changes marked with TODO 4
──────────────────────────────────────────────────────────────────

TODAY'S TODOs
  TODO 1 — Monster.__init__()      (new class)
  TODO 2 — Monster.update()        (new class)
  TODO 3 — Game.check_collisions() (new method)
  TODO 3 — Game.spawn_monsters()   (new method)
  TODO 4 — Wire it all together    (3 small edits inside Game)
"""

# ─────────────────────────────────────────────────────────────────────────────
# NEW CONSTANTS — add these to the constants section at the top of your file
# ─────────────────────────────────────────────────────────────────────────────

RED_MONSTER    = 0
BLUE_MONSTER   = 1
GREEN_MONSTER  = 2
YELLOW_MONSTER = 3

MONSTER_COLORS    = [RED, BLUE, GREEN, YELLOW]        # RED/BLUE etc. already defined
MONSTER_NAMES     = ["RED", "BLUE", "GREEN", "YELLOW"]
MONSTERS_PER_TYPE = 4    # how many of each type spawn per round


# ─────────────────────────────────────────────────────────────────────────────
# TODO 1 & 2 — ADD this entire class right before your Player class
# ─────────────────────────────────────────────────────────────────────────────
class Monster(pygame.sprite.Sprite):
    """
    A Monster sprite that bounces around the screen.
    There are 4 types (red / blue / green / yellow).
    The player must catch whichever type the HUD is showing.
    """

    def __init__(self, monster_type, x, y, game):
        """
        ╔══════════════════════════════════════════════════╗
        ║  TODO 1 — Monster.__init__()                     ║
        ╠══════════════════════════════════════════════════╣
        ║  a) Call super().__init__()                      ║
        ║  b) Store monster_type and game as attributes    ║
        ║  c) Load the correct image from assets/          ║
        ║     Images:  red_monster.png  blue_monster.png   ║
        ║              green_monster.png  yellow_monster.png
        ║     Hint: use monster_type (0-3) to pick the file║
        ║  d) Set self.rect from the image                 ║
        ║  e) Place rect at starting x, y                  ║
        ║  f) Give the monster a random velocity:          ║
        ║       self.dx = random.choice([-1, 1])           ║
        ║                * random.randint(2, 5)            ║
        ║       self.dy = same pattern                     ║
        ╚══════════════════════════════════════════════════╝
        """
        pass  # ← DELETE this line and write your code below!



    def update(self):
        """
        ╔══════════════════════════════════════════════════╗
        ║  TODO 2 — Monster.update()                       ║
        ╠══════════════════════════════════════════════════╣
        ║  a) Move the monster each frame:                 ║
        ║       self.rect.x += self.dx                     ║
        ║       self.rect.y += self.dy                     ║
        ║  b) Bounce off LEFT / RIGHT walls:               ║
        ║       if rect.left < 0 or rect.right > WIDTH     ║
        ║           self.dx *= -1                          ║
        ║  c) Bounce off TOP / BOTTOM walls:               ║
        ║       if rect.top < 0 or rect.bottom > HEIGHT    ║
        ║           self.dy *= -1                          ║
        ╚══════════════════════════════════════════════════╝
        """
        pass  # ← DELETE this line and write your code below!



# ─────────────────────────────────────────────────────────────────────────────
# TODO 3 — ADD these two methods inside your Game class
#           (paste them in the "utility methods" area, before update/draw)
# ─────────────────────────────────────────────────────────────────────────────

#    def spawn_monsters(self):
#        """
#        ╔══════════════════════════════════════════════════╗
#        ║  TODO 3a — spawn_monsters()                      ║
#        ╠══════════════════════════════════════════════════╣
#        ║  Use a nested for loop:                          ║
#        ║    for mtype in range(4):                        ║
#        ║        for _ in range(MONSTERS_PER_TYPE):        ║
#        ║            pick random x (0 to WINDOW_WIDTH)     ║
#        ║            pick random y (0 to WINDOW_HEIGHT//2) ║
#        ║            create Monster(mtype, x, y, self)     ║
#        ║            add it to self.monster_group          ║
#        ╚══════════════════════════════════════════════════╝
#        """
#        pass  # ← DELETE this line and write your code below!
#
#
#    def check_collisions(self):
#        """
#        ╔══════════════════════════════════════════════════╗
#        ║  TODO 3b — check_collisions()                    ║
#        ╠══════════════════════════════════════════════════╣
#        ║  Step 1 — Detect a hit:                          ║
#        ║    hit = pygame.sprite.spritecollideany(         ║
#        ║              self.player, self.monster_group)    ║
#        ║                                                  ║
#        ║  Step 2 — If hit is not None:                    ║
#        ║    if hit.monster_type == self.target_monster_type
#        ║        ✅ CORRECT CATCH:                         ║
#        ║          hit.kill()                              ║
#        ║          self.score += 10                        ║
#        ║          self.monsters_caught += 1               ║
#        ║          if monsters_caught >= total_monsters:   ║
#        ║              self.start_new_round()              ║
#        ║          else:                                   ║
#        ║              self.choose_new_target()            ║
#        ║    else:                                         ║
#        ║        ❌ WRONG MONSTER:                         ║
#        ║          self.lives -= 1                         ║
#        ║          if self.lives <= 0:                     ║
#        ║              self.playing = False                ║
#        ╚══════════════════════════════════════════════════╝
#        """
#        pass  # ← DELETE this line and write your code below!


# ─────────────────────────────────────────────────────────────────────────────
# TODO 4 — THREE small wiring changes in your existing Game class
# ─────────────────────────────────────────────────────────────────────────────

# ── TODO 4a ── at the end of Game.__init__(), add these lines:
#
#     self.target_monster_type = RED_MONSTER
#     self.monsters_caught     = 0
#     self.total_monsters      = MONSTERS_PER_TYPE
#     self.spawn_monsters()
#     self.choose_new_target()


# ── TODO 4b ── already done — spawn_monsters() handles it ─────────────────


# ── TODO 4c ── inside Game.update(), add ONE line at the bottom:
#
#     def update(self):
#         self.player_group.update()
#         self.monster_group.update()
#         self.check_collisions()   # ← ADD THIS LINE