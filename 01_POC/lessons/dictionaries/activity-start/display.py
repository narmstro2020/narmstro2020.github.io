# ============================================
# display.py — Display & Formatting Helpers
# ============================================
# Contains functions for displaying the banner,
# menu, and dividers. These are DONE for you.
# ============================================


def show_banner():
    print("╔══════════════════════════════════════╗")
    print("║     🎮 Video Game Inventory System   ║")
    print("╚══════════════════════════════════════╝")
    print()


def show_menu():
    print("\n🎮 MAIN MENU")
    print("  1. View Inventory")
    print("  2. View Player Stats")
    print("  3. View Shop")
    print("  4. Buy Item")
    print("  5. Sell Item")
    print("  6. Find/Add Item")
    print("  7. Use Item")
    print("  8. Equip Item")
    print("  9. Count All Items")
    print("  0. Quit")
    print()


def show_divider():
    print("\n" + "─" * 40)
