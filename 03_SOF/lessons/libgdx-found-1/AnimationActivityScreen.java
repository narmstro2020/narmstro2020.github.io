package io.github.found1;

// ============================================================
// 🎮 ANIMATION ACTIVITY — BUILD YOUR OWN ANIMATION SCREEN
// ============================================================
//
// Activity — L07 · Apr 15, 2026 · 15 pts
//
// SCENARIO:
//   You have the same three sprite sheets from the demo, but the Screen
//   is empty. Build it from scratch, section by section.
//
// REQUIREMENTS:
//   1. Place player.png, enemy-slime.png, coin.png in your assets/ folder
//   2. In your Main.java, set this screen: setScreen(new AnimationActivityScreen());
//   3. Complete every TODO — run frequently to catch errors early
//
// CHECKLIST (what "done" looks like):
//   ☐ Player appears and cycles through idle animation when no keys pressed
//   ☐ Pressing LEFT/RIGHT runs the player with run animation
//   ☐ Sprite flips to face the direction of movement
//   ☐ Pressing SPACE plays jump animation ONCE (doesn't loop)
//   ☐ Pressing DOWN plays a crouch animation (NEW — not in demo!)
//   ☐ Slime enemy bounces on the right side
//   ☐ A row of 4 spinning coins appears above
//   ☐ No sprite sheets stay loaded after the screen closes (dispose!)
//
// ============================================================

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.Input;
import com.badlogic.gdx.Screen;
import com.badlogic.gdx.graphics.GL20;
import com.badlogic.gdx.graphics.OrthographicCamera;
import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.graphics.g2d.Animation;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import com.badlogic.gdx.graphics.g2d.TextureRegion;

public class AnimationActivityScreen implements Screen {

    // ══════════════════════════════════════════
    // SECTION 1: State Tracking (2 pts)
    // ══════════════════════════════════════════

    // TODO 1a: Create an enum called PlayerState with FOUR values:
    //   IDLE, RUNNING, JUMPING, CROUCHING
    //   (The demo only had 3 — you're adding CROUCHING!)


    // TODO 1b: Declare these fields (initialize where indicated):
    //   - SpriteBatch called batch
    //   - OrthographicCamera called camera
    //   - Texture fields: playerSheet, enemySheet, coinSheet
    //   - Animation<TextureRegion> fields: idleAnim, runAnim, jumpAnim, crouchAnim
    //     (Note: crouchAnim is NEW — you need one for your 4th state)
    //   - Animation<TextureRegion> fields: slimeAnim, coinAnim
    //   - float stateTime initialized to 0f
    //   - PlayerState state initialized to PlayerState.IDLE
    //   - boolean facingRight initialized to true
    //   - float playerX initialized to 100f
    //   - float playerY initialized to 100f


    // ══════════════════════════════════════════
    // SECTION 2: Loading Assets in show() (4 pts)
    // ══════════════════════════════════════════

    @Override
    public void show() {
        // TODO 2a: Initialize batch and camera
        //   - batch = new SpriteBatch()
        //   - camera = new OrthographicCamera()
        //   - Call camera.setToOrtho(false, 640, 480)


        // TODO 2b: Load "player.png" into playerSheet


        // TODO 2c: Split the player sheet into a 2D TextureRegion array
        //   - Use TextureRegion.split(playerSheet, 64, 64)
        //   - Store the result in a variable called pGrid


        // TODO 2d: Create the player animations
        //   - idleAnim uses pGrid[0] with frame duration 0.2f
        //   - runAnim  uses pGrid[1] with frame duration 0.1f
        //   - jumpAnim uses pGrid[2] with frame duration 0.15f
        //   - crouchAnim ALSO uses pGrid[0] but with frame duration 0.5f
        //     (reusing idle frames but slower = "holding still crouched")


        // TODO 2e: Set play modes
        //   - idleAnim, runAnim, crouchAnim → LOOP
        //   - jumpAnim → NORMAL (plays once and stops on last frame)


        // TODO 2f: Load "enemy-slime.png" into enemySheet,
        //   split it with TextureRegion.split(enemySheet, 64, 64) into eGrid,
        //   then create slimeAnim from eGrid[0] with frame duration 0.15f,
        //   and set its play mode to LOOP.


        // TODO 2g: Load "coin.png" into coinSheet,
        //   split it with TextureRegion.split(coinSheet, 32, 32) into cGrid,
        //   (⚠️ coins are 32×32, not 64×64!)
        //   then create coinAnim from cGrid[0] with frame duration 0.08f,
        //   and set its play mode to LOOP.

    }


    // ══════════════════════════════════════════
    // SECTION 3: Input & State Updates (3 pts)
    // ══════════════════════════════════════════

    @Override
    public void render(float delta) {
        // TODO 3a: Add delta to stateTime (this drives the animation clock)


        // TODO 3b: Save the current state in a variable called "previous"
        //   (You'll use this later to detect state changes)


        // TODO 3c: Write an if/else-if chain that sets `state` based on input:
        //   - If SPACE is pressed           → state = JUMPING
        //   - Else if DOWN is pressed       → state = CROUCHING
        //   - Else if LEFT is pressed       → state = RUNNING,
        //                                     facingRight = false,
        //                                     playerX -= 100 * delta
        //   - Else if RIGHT is pressed      → state = RUNNING,
        //                                     facingRight = true,
        //                                     playerX += 100 * delta
        //   - Else                          → state = IDLE
        //   (Use Input.Keys.SPACE, Input.Keys.DOWN, Input.Keys.LEFT, Input.Keys.RIGHT)


        // TODO 3d: If state changed from previous, reset stateTime to 0f
        //   (This makes the new animation start from frame 0)


        // ══════════════════════════════════════════
        // SECTION 4: Picking the Right Animation (3 pts)
        // ══════════════════════════════════════════

        // TODO 4a: Declare an Animation<TextureRegion> variable called `current`,
        //   and use a switch statement to assign the correct animation:
        //     IDLE      → idleAnim
        //     RUNNING   → runAnim
        //     JUMPING   → jumpAnim
        //     CROUCHING → crouchAnim
        //     (default  → idleAnim, just in case)


        // TODO 4b: Declare a boolean called `looping`:
        //   true for every state EXCEPT JUMPING (jump plays once).
        //   Hint: boolean looping = state != PlayerState.JUMPING;


        // TODO 4c: Get the current player frame:
        //   TextureRegion playerFrame = current.getKeyFrame(stateTime, looping);


        // TODO 4d: Handle flipping based on facingRight.
        //   Use TWO if statements:
        //   - If NOT facingRight AND playerFrame is NOT already flipped → flip it
        //   - Else if facingRight AND playerFrame IS flipped → flip it back
        //   (Methods: playerFrame.isFlipX() and playerFrame.flip(true, false))


        // TODO 4e: Get the slime and coin frames
        //   TextureRegion slimeFrame = slimeAnim.getKeyFrame(stateTime, true);
        //   TextureRegion coinFrame  = coinAnim.getKeyFrame(stateTime, true);


        // ══════════════════════════════════════════
        // SECTION 5: Drawing (2 pts)
        // ══════════════════════════════════════════

        // TODO 5a: Clear the screen with a dark background color.
        //   Gdx.gl.glClearColor(0.1f, 0.1f, 0.15f, 1f);
        //   Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT);


        // TODO 5b: Set the batch's projection matrix from the camera
        //   batch.setProjectionMatrix(camera.combined);


        // TODO 5c: Begin the batch, draw all four of these, then end the batch:
        //   - playerFrame at (playerX, playerY)
        //   - slimeFrame  at (400f, 100f)
        //   - FOUR coinFrames in a row starting at (260f, 250f), spaced 40px apart
        //     (260, 300, 340, 380) — one more coin than the demo had!


    }


    // ══════════════════════════════════════════
    // SECTION 6: Cleanup (1 pt)
    // ══════════════════════════════════════════

    @Override
    public void resize(int width, int height) {
        // Already done for you — this keeps the camera matching the window size
        camera.setToOrtho(false, width, height);
    }

    @Override public void pause() {}
    @Override public void resume() {}
    @Override public void hide() {}

    @Override
    public void dispose() {
        // TODO 6: Dispose of batch and all three sheets to prevent memory leaks
        //   - batch.dispose()
        //   - playerSheet.dispose()
        //   - enemySheet.dispose()
        //   - coinSheet.dispose()


    }
}
