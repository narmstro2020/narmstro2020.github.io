package io.github.armstrong;

import com.badlogic.gdx.Game;

public class Main extends Game {

    @Override
    public void create() {
        // DAY 5 TODO: Change this to: setScreen(new MenuScreen(this));
        //   (Once you've created MenuScreen.java)
        setScreen(new GameScreen(this));
    }
}
