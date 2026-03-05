# ============================================================
#  MONSTER WRANGLER — Build Day 1
#  Principles of Computing | Unit 3 — OOP + Game Projects
#  March 5, 2025
# ============================================================
#
#  TODAY'S GOAL: Build the Game class and Player class.
#  By the end of class your game window should open, the
#  player should move with arrow keys, and the HUD should
#  display on screen.
#
#  BUILD PLAN:
#    Day 1 (Today) → Game class + Player class
#    Day 2          → Monster class + collision logic
#    Day 3          → HUD details + pause/reset + polish
#
#  HOW TO TEST: Run your file after each TODO block.
#  Watch the window — does it behave as described?
#
#  SUBMISSION: 20 points — push to GitHub, link on Canvas.
# ============================================================

import pygame, random

# ---- Initialize pygame ----
pygame.init()

# ---- Display Window ----
WINDOW_WIDTH  = 1200
WINDOW_HEIGHT = 700
display_surface = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
pygame.display.set_caption("Monster Wrangler")

# ---- FPS and Clock ----
FPS   = 60
clock = pygame.time.Clock()


# ==============================================================
#  TODO 1 — Game.__init__   (10 min)
# ==============================================================
#  Complete the __init__ method inside the Game class.
#  All game attribute lines that say  # <-- TODO  need a value.
#
#  When done and run:
#    • No errors on startup
#    • Window opens (black screen is fine for now)
# ==============================================================

class Game():
    """A class to control gameplay"""

    def __init__(self, player, monster_group):
        """Initialize the game object"""

        # -- Game tracking values --
        self.score        = 0          # <-- already given
        self.round_number = 0          # <-- already given
        self.round_time   = 0          # <-- already given
        self.frame_count  = 0          # <-- already given

        # -- References to other objects --
        self.player        = player          # <-- TODO  store the player parameter
        self.monster_group = monster_group   # <-- TODO  store the monster_group parameter

        # -- Sound --
        # TODO: load "next_level.wav" into self.next_level_sound
        # self.next_level_sound = pygame.mixer.Sound( ??? )
        self.next_level_sound = None  # replace this line

        # -- Font --
        # TODO: load "Abrushow.ttf" at size 24 into self.font
        # self.font = pygame.font.Font( ???, ??? )
        self.font = None  # replace this line

        # -- Monster target images --
        # TODO: load all four monster images:
        #   blue_monster.png, green_monster.png,
        #   purple_monster.png, yellow_monster.png
        # Store them in a LIST called self.target_monster_images
        # Order matters! index 0=blue, 1=green, 2=purple, 3=yellow
        blue_image   = None  # TODO: pygame.image.load(???)
        green_image  = None  # TODO
        purple_image = None  # TODO
        yellow_image = None  # TODO
        self.target_monster_images = [blue_image, green_image, purple_image, yellow_image]

        # -- Choose a random starting target type --
        # TODO: pick a random int between 0 and 3 for self.target_monster_type
        self.target_monster_type  = 0  # replace with random.randint(???, ???)

        # TODO: use target_monster_type as an index into self.target_monster_images
        self.target_monster_image = self.target_monster_images[self.target_monster_type]

        # -- Target monster display rect --
        self.target_monster_rect          = self.target_monster_image.get_rect() if self.target_monster_image else pygame.Rect(0,0,64,64)
        self.target_monster_rect.centerx  = WINDOW_WIDTH // 2
        self.target_monster_rect.top      = 30


    # ==============================================================
    #  TODO 2 — Game.update   (5 min)
    # ==============================================================
    #  Frame counter counts up to FPS (60), then increments
    #  round_time by 1 and resets. Add the call to check_collisions()
    #  at the bottom.
    #
    #  When done:
    #    • No crash — game loop runs smoothly
    # ==============================================================

    def update(self):
        """Update the game object"""
        self.frame_count += 1
        if self.frame_count == FPS:
            self.round_time  += 1
            self.frame_count  = 0

        # TODO: call self.check_collisions() here
        # self.check_collisions()


    # ==============================================================
    #  TODO 3 — Game.draw   (15 min)
    # ==============================================================
    #  Render all HUD elements to display_surface.
    #  Complete each blit() / draw.rect() call marked TODO.
    #
    #  When done:
    #    • Score, Lives, Current Round appear top-left
    #    • Round Time, Warps appear top-right
    #    • "Current Catch" label + monster image appear centered at top
    #    • Colored border box appears around the play area
    # ==============================================================

    def draw(self):
        """Draw the HUD to the display"""

        # -- Colors --
        WHITE  = (255, 255, 255)
        BLUE   = (20,  176, 235)
        GREEN  = (87,  201,  47)
        PURPLE = (226,  73, 243)
        YELLOW = (243, 157,  20)

        # List: index matches monster type
        colors = [BLUE, GREEN, PURPLE, YELLOW]

        # -- Build text surfaces --
        catch_text  = self.font.render("Current Catch", True, WHITE)
        catch_rect  = catch_text.get_rect()
        catch_rect.centerx = WINDOW_WIDTH // 2
        catch_rect.top      = 5

        score_text  = self.font.render("Score: " + str(self.score), True, WHITE)
        score_rect  = score_text.get_rect()
        score_rect.topleft = (5, 5)

        lives_text  = self.font.render("Lives: " + str(self.player.lives), True, WHITE)
        lives_rect  = lives_text.get_rect()
        lives_rect.topleft = (5, 35)

        round_text  = self.font.render("Current Round: " + str(self.round_number), True, WHITE)
        round_rect  = round_text.get_rect()
        round_rect.topleft = (5, 65)

        time_text   = self.font.render("Round Time: " + str(self.round_time), True, WHITE)
        time_rect   = time_text.get_rect()
        time_rect.topright  = (WINDOW_WIDTH - 10, 5)

        warp_text   = self.font.render("Warps: " + str(self.player.warps), True, WHITE)
        warp_rect   = warp_text.get_rect()
        warp_rect.topright  = (WINDOW_WIDTH - 10, 35)

        # TODO: blit all six text surfaces to display_surface
        # Pattern: display_surface.blit(text_surface, rect)
        # display_surface.blit(catch_text, catch_rect)
        # display_surface.blit(score_text, score_rect)
        # ... (lives, round, time, warp)

        # TODO: blit self.target_monster_image at self.target_monster_rect
        # display_surface.blit(???, ???)

        # TODO: draw a colored outline box around the target monster image
        # pygame.draw.rect(display_surface, colors[self.target_monster_type],
        #                  (WINDOW_WIDTH//2 - 32, 30, 64, 64), 2)

        # TODO: draw the colored play area border
        # pygame.draw.rect(display_surface, colors[self.target_monster_type],
        #                  (0, 100, WINDOW_WIDTH, WINDOW_HEIGHT - 200), 4)


    # ---- These methods are stubs — you'll build them on Days 2 & 3 ----

    def check_collisions(self):
        """Check for collisions between player and monsters — Day 2"""
        pass

    def start_new_round(self):
        """Start a new round — Day 2"""
        self.round_number += 1
        self.round_time    = 0
        self.frame_count   = 0

    def choose_new_target(self):
        """Choose a new target monster — Day 2"""
        pass

    def pause_game(self, main_text, sub_text):
        """Pause the game and show message — Day 3"""
        global running
        WHITE = (255, 255, 255)
        BLACK = (0, 0, 0)

        if self.font:
            main_surface = self.font.render(main_text, True, WHITE)
            main_rect    = main_surface.get_rect(center=(WINDOW_WIDTH//2, WINDOW_HEIGHT//2))
            sub_surface  = self.font.render(sub_text,  True, WHITE)
            sub_rect     = sub_surface.get_rect(center=(WINDOW_WIDTH//2, WINDOW_HEIGHT//2 + 64))
            display_surface.fill(BLACK)
            display_surface.blit(main_surface, main_rect)
            display_surface.blit(sub_surface,  sub_rect)
        else:
            display_surface.fill(BLACK)

        pygame.display.update()

        is_paused = True
        while is_paused:
            for event in pygame.event.get():
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_RETURN:
                        is_paused = False
                if event.type == pygame.QUIT:
                    is_paused = False
                    running   = False

    def reset_game(self):
        """Reset the game — Day 3"""
        pass


# ==============================================================
#  TODO 4 — Player.__init__   (10 min)
# ==============================================================
#  Build the Player sprite.
#  Hint: Call super().__init__() first — it registers the sprite
#  with pygame's sprite system and sets up .image and .rect.
#
#  When done:
#    • Player image visible at bottom-center of window
# ==============================================================

class Player(pygame.sprite.Sprite):
    """A player class that the user can control"""

    def __init__(self):
        """Initialize the player"""
        super().__init__()

        # TODO: load knight.png into self.image
        # self.image = pygame.image.load( ??? )
        self.image = pygame.Surface((32, 64))    # placeholder — replace this line
        self.image.fill((0, 200, 255))

        # TODO: get the rect from self.image and position it:
        #   centerx = WINDOW_WIDTH // 2
        #   bottom  = WINDOW_HEIGHT
        self.rect = self.image.get_rect()
        # self.rect.centerx = ???
        # self.rect.bottom  = ???

        # TODO: set these attributes
        self.lives    = 5
        self.warps    = 2
        self.velocity = 8

        # TODO: load three sounds
        # self.catch_sound = pygame.mixer.Sound("catch.wav")
        # self.die_sound   = pygame.mixer.Sound("die.wav")
        # self.warp_sound  = pygame.mixer.Sound("warp.wav")
        self.catch_sound = None   # replace each None with actual Sound load
        self.die_sound   = None
        self.warp_sound  = None


    # ==============================================================
    #  TODO 5 — Player.update   (10 min)
    # ==============================================================
    #  Move player with arrow keys, but DON'T let them leave
    #  the play area:
    #    LEFT  boundary → x > 0
    #    RIGHT boundary → x < WINDOW_WIDTH
    #    UP    boundary → y > 100        (top HUD boundary)
    #    DOWN  boundary → y < WINDOW_HEIGHT - 100  (bottom safe zone)
    #
    #  When done:
    #    • Player moves smoothly with arrow keys
    #    • Can't go outside the colored border box
    # ==============================================================

    def update(self):
        """Update the player — handle keyboard movement"""
        keys = pygame.key.get_pressed()

        # TODO: add movement for all four directions with boundary checks
        # Pattern:
        #   if keys[pygame.K_LEFT] and self.rect.left > 0:
        #       self.rect.x -= self.velocity
        pass


    # ==============================================================
    #  TODO 6 — Player.warp + Player.reset   (5 min)
    # ==============================================================
    #  warp()  → if warps > 0, decrement warps,
    #             play warp_sound, move bottom to WINDOW_HEIGHT
    #  reset() → move centerx to WINDOW_WIDTH//2, bottom to WINDOW_HEIGHT
    #
    #  When done:
    #    • Pressing SPACE warps player to bottom
    #    • Warp counter on HUD decreases
    # ==============================================================

    def warp(self):
        """Warp the player to the safe zone at the bottom"""
        if self.warps > 0:
            self.warps -= 1
            if self.warp_sound:
                self.warp_sound.play()
            # TODO: reposition player rect.bottom to WINDOW_HEIGHT
            pass

    def reset(self):
        """Reset the player position to bottom-center"""
        # TODO: set rect.centerx and rect.bottom
        pass


# ==============================================================
#  MONSTER — Stub for Days 2 (do not edit today)
# ==============================================================

class Monster(pygame.sprite.Sprite):
    """A class to create enemy monster objects — built on Day 2"""
    def __init__(self, x, y, image, monster_type):
        super().__init__()
        self.image      = image if image else pygame.Surface((64,64))
        self.rect       = self.image.get_rect()
        self.rect.topleft = (x, y)
        self.type       = monster_type
        self.dx         = random.choice([-1, 1])
        self.dy         = random.choice([-1, 1])
        self.velocity   = random.randint(1, 5)

    def update(self):
        self.rect.x += self.dx * self.velocity
        self.rect.y += self.dy * self.velocity
        if self.rect.left <= 0 or self.rect.right >= WINDOW_WIDTH:
            self.dx = -self.dx
        if self.rect.top <= 100 or self.rect.bottom >= WINDOW_HEIGHT - 100:
            self.dy = -self.dy


# ==============================================================
#  TODO 7 — Wire it together   (5 min)
# ==============================================================
#  Create the groups, objects, and start the game.
#  The main loop is provided — just run it and test.
#
#  When done:
#    • Window opens with "Monster Wrangler" title screen
#    • Press Enter → play area appears with HUD
#    • Player moves with arrows, warps with SPACE
# ==============================================================

# -- Create sprite groups --
my_player_group  = pygame.sprite.Group()
my_player        = Player()
my_player_group.add(my_player)

my_monster_group = pygame.sprite.Group()

# -- Create Game object --
my_game = Game(my_player, my_monster_group)

# -- Show title screen and start round 1 --
my_game.pause_game("Monster Wrangler", "Press 'Enter' to begin")
my_game.start_new_round()


# ---- Main Game Loop (given — do not edit) ----
running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE:
                my_player.warp()

    display_surface.fill((0, 0, 0))

    my_player_group.update()
    my_player_group.draw(display_surface)

    my_monster_group.update()
    my_monster_group.draw(display_surface)

    my_game.update()
    my_game.draw()

    pygame.display.update()
    clock.tick(FPS)

pygame.quit()
