# 5-Minute Project Presentation & Live Demo Script
## Keyboard Warrior: Stickman Typing Battle
**Presenter:** Sanket Ananta Ubhare (Roll No: CS-9148)  
**Department:** Information Technology & Computer Science  
**College:** MES's The D. G. Ruparel College of Arts, Science and Commerce  

---

### Timing Breakdown (Total: 5–7 Minutes)

| Minute | Stage | Key Actions & Speaking Points |
| :--- | :--- | :--- |
| **0:00 – 1:00** | **Introduction & Problem Statement** | Introduce self, project title, and core objective: Gamifying touch-typing training into high-octane 60 FPS combat. |
| **1:00 – 2:30** | **Live Gameplay Demonstration** | Demonstrate real-time typing, procedural stickman animations, red katana slash effects, sound synthesis, and stance cards. |
| **2:30 – 3:30** | **Meme Combo Maker & Customization** | Open the Meme Combo Maker modal, select a preset, showcase dynamic custom phrases and background themes. |
| **3:30 – 4:30** | **Backend Architecture & Anti-Cheat** | Show the leaderboard, submit a score, demonstrate server-side anti-cheat rejection of forged inputs. |
| **4:30 – 5:00** | **Conclusion & Viva Q&A Handover** | Summarize the technical takeaways and open the floor for examiner questions. |

---

### Step-by-Step Demonstration Walkthrough

#### Stage 1: Introduction (0:00 – 1:00)
> *"Respected Examiners and Teachers, good morning. My name is Sanket Ananta Ubhare, Roll Number CS-9148 from T.Y.B.Sc. Computer Science. Today I am presenting **Keyboard Warrior: Stickman Typing Battle**.*
>
> *Traditional typing tutors like Typing.com or Monkeytype focus on dry text passages with little engagement. Keyboard Warrior converts every keystroke into direct fighting maneuvers. We built this engine directly on HTML5 Canvas using a fixed-timestep 60 FPS game loop, procedural skeletal kinematics, and a Node.js/Express leaderboard backend with anti-cheat protection."*

#### Stage 2: Live Gameplay & Mechanics (1:00 – 2:30)
1. Navigate browser to `http://localhost:3000`.
2. Point out the on-screen **60 FPS Counter** in the top-left corner:
   > *"Notice the stable 60 FPS tick. Our loop uses a fixed 16.66ms accumulator to ensure physics determinism across all monitor refresh rates."*
3. Point out the characters:
   > *"Both fighters are generated procedurally on Canvas without external sprite images. The player wears a signature flat cap, while the opponent wears combat glasses."*
4. Start typing the target word shown in the glowing target box:
   > *"As I type, notice the real-time keystroke feedback: mechanical switch clicks synthesized through the Web Audio API, bright red katana slash lines across the opponent, and floating damage numbers."*
5. Demonstrate a Stance Card:
   > *"I can also hit hotkeys or click stance cards at the bottom—pressing TAB activates my Guard Stance to parry incoming hits, or pressing '1' executes a swift katana strike."*

#### Stage 3: Meme Combo Maker & Dynamic Modes (2:30 – 3:30)
1. Click the **⚡ MEME COMBO** button at the top.
2. Select Preset 1 (`TYPE TO COMBO! / AND WRITE! / YOUR OWN!`) or click `⚡ BACKGROUND: DOJO`.
3. Click **■ PLAY CUSTOM COMBO**:
   > *"This mode allows custom sentences or memes to be loaded dynamically. Teachers can input custom vocabulary or programming keywords, and the engine immediately structures the battle around them."*

#### Stage 4: Match End & Backend Leaderboard (3:30 – 4:30)
1. Complete the battle until Enemy HP hits 0:
   > *"The enemy transitions into the KNOCKOUT state, freezing input and playing the victory stinger. The summary screen displays final WPM, accuracy, streak, and calculated score."*
2. Enter name `Sanket` and click **Submit Score**.
3. View the **Leaderboard Table**:
   > *"The score is dispatched to our Express REST API. Notice the rank update. The server validates every payload using anti-cheat middleware—capping WPM at 250, verifying accuracy bounds, and stamping the submission with an authoritative server timestamp to prevent client tampering."*

#### Stage 5: Wrap-up & Viva Q&A (4:30 – 5:00)
> *"To summarize, Keyboard Warrior demonstrates high-performance web engineering: modular code architecture, mathematical animation kinematics, asset-free Web Audio synthesis, and secure backend integration. Thank you, and I am now ready for your questions."*
