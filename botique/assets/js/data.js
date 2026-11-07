/* BOTIQUE — catalogue data
   100 products, ranked by estimated 30-day units across Amazon, TikTok Shop and Meta Shops.
   Figures are editorial estimates, not platform-official data. Snapshot: November 2026. */
(function (global) {
  'use strict';

  // rank, id, name, brand, category, form, price, compareAt, rating, reviews, units, platforms, tagline, note, year, tone, badge
  const RAW = [
    [1,'yonbo-y1','Yonbo Y1 AI Robot Dog','Yonbo','dogs','dog',49.99,69.99,4.3,18400,4200,'tiktok,amazon','The $50 robot dog your FYP can’t stop showing you.','The viral entry point: it walks, barks, flips, and costs less than dinner for four.',2025,0,'Viral'],
    [2,'bubblepal','BubblePal','Haivivi','companion','orb',129.99,149.99,4.4,6200,3100,'amazon,tiktok','Turn any plush toy into a talking best friend.','A screen-free AI puck that clips onto the teddy bear your kid already loves.',2024,1,'Bestseller'],
    [3,'eilik','Eilik','Energize Lab','companion','desk',139.99,159.99,4.6,3214,2800,'amazon,tiktok,meta','A pocket-sized drama queen with 1,000 faces.','No Wi-Fi, no app, no subscription — just pure desk-side chaos.',2024,0,'Bestseller'],
    [4,'fuzozo','Fuzozo','Robopoet','companion','plush',59.00,69.00,4.5,9800,2400,'tiktok,meta','A 140-gram emotional support blob.','The purse-sized AI pet that reads your mood and remembers your week.',2025,3,'Viral'],
    [5,'ebo-se','Enabot EBO SE','Enabot','pets','orb',139.00,169.00,4.4,1200,1900,'amazon,meta','A pet camera that actually follows the cat.','The affordable way to check in, talk back, and fire a laser across the living room.',2023,2,''],
    [6,'loona','Loona','KEYi Tech','companion','dog',449.00,499.00,4.2,2100,1600,'amazon,tiktok','A robot dog with ChatGPT and main-character energy.','Rolls around, recognises faces, and reacts to gestures like a tiny drama student.',2022,4,'Editor’s pick'],
    [7,'emo','EMO','Living.AI','companion','desk',279.00,299.00,4.4,4800,1500,'amazon,meta','The desk pet that walks, talks and judges your deadlines.','A 1,000-expression desktop companion with real movement and a ChatGPT brain.',2021,7,''],
    [8,'miko-mini','Miko Mini','Miko','companion','screen',149.00,199.00,4.3,3600,1400,'amazon,meta','A pocket-sized tutor with a big personality.','The screen-faced sidekick for curious kids, with stories, games and gentle guardrails.',2023,8,''],
    [9,'ropet','Ropet','Ropet','companion','plush',199.00,249.00,4.4,1300,1300,'amazon,tiktok','A warm, furry friend that actually recognises you.','Soft to hold, warm to the touch, and quietly attached to your routine.',2024,5,''],
    [10,'joy-for-all-pup','Joy for All Companion Pup','Ageless Innovation','pets','plush',139.99,159.99,4.5,8900,1200,'amazon','The companion pet designed for older hands.','No Wi-Fi, no charging anxiety — just a responsive, huggable pup.',2015,5,''],
    [11,'aibi','AIBI Pocket Pet','Living.AI','companion','orb',249.00,269.00,4.3,1600,1150,'amazon,tiktok','The world’s smallest AI pet fits in your pocket.','A magnetic, screen-faced buddy for commutes, desks and “look at this” moments.',2024,4,''],
    [12,'eiliko','Eiliko','Energize Lab','companion','orb',59.90,69.90,4.4,2200,1100,'tiktok,amazon','Eilik’s tiny cousin, now small enough to carry.','All the expressive chaos of Eilik in a clip-on, pocket-friendly body.',2025,1,'New'],
    [13,'moflin','Moflin','Casio','companion','plush',429.00,449.00,4.4,5847,1050,'amazon,meta','A $429 ball of fluff that forms a personality.','No screen, no camera, no cloud — just an emotional AI pet that grows attached.',2024,6,'Premium'],
    [14,'miko-3','Miko 3','Miko','companion','screen',199.00,249.00,4.2,5200,1000,'amazon,meta','A moving, talking tutor for the kid who asks why.','A rolling classroom buddy with 50,000+ hours of kid-safe content.',2022,2,''],
    [15,'luka-mini','Luka Mini','Ling','companion','screen',109.00,129.00,4.5,2400,950,'amazon','A reading buddy that makes paper books talk.','Points at words, reads aloud, and turns bedtime into a duet.',2023,5,''],
    [16,'ebo-air-2','Enabot EBO Air 2','Enabot','pets','orb',199.00,229.00,4.5,2300,900,'amazon,meta','The tiny rover that turns pet-watching into a game.','Nine centimetres tall, so it can creep under the sofa and find the lost toy.',2024,2,''],
    [17,'sphero-mini','Sphero Mini','Sphero','stem','orb',49.99,59.99,4.4,11200,880,'amazon','A ping-pong-ball robot with a serious coding habit.','The cheapest way to make “programming” feel like a game.',2017,8,'Budget hero'],
    [18,'dji-neo','DJI Neo','DJI','rc','drone',199.00,219.00,4.6,4300,850,'amazon,meta','A palm-sized drone that takes off from your hand.','No controller needed — just press the button and let it follow you.',2024,7,''],
    [19,'ai-flying-ball','AI Flying Ball','SkyTrix','rc','orb',15.99,24.99,4.1,15600,820,'tiktok,amazon','The $16 party trick that refuses to land.','A boomerang, a hover toy and a group-chat video all at once.',2025,3,'Budget hero'],
    [20,'wowwee-chipper','WowWee Chipper','WowWee','pets','dog',59.99,69.99,4.3,6800,780,'amazon','A robot pup that flips, sings and begs for more.','The classic toy-aisle crowd-pleaser, now with app-free interactivity.',2023,5,''],
    [21,'tamagotchi-uni','Tamagotchi Uni','Bandai','pets','screen',59.99,64.99,4.3,9100,760,'amazon','The forever-favourite digital pet, now with Wi-Fi.','Nostalgia in a wristwatch, with a whole online world of other pets.',2023,3,''],
    [22,'mama-surprise','Little Live Pets Mama Surprise','Moose Toys','pets','plush',59.99,69.99,4.4,7200,740,'amazon,tiktok','A plush guinea pig with a very big secret.','The unboxing moment that keeps on giving — literally.',2023,3,''],
    [23,'ebo-rola-mini','Enabot EBO ROLA Mini','Enabot','pets','orb',162.00,189.00,4.4,793,720,'amazon','A rover with 25 days of standby and zero drama.','A 2K camera on wheels for checking in without rearranging your day.',2024,2,''],
    [24,'cozmo-2','Cozmo 2.0','Digital Dream Labs','companion','desk',199.00,249.00,4.2,1900,700,'amazon','The bad-tempered cube that started it all.','A tiny, expressive OG with a loyal cult following and a real personality.',2016,8,''],
    [25,'botley-2','Botley 2.0','Learning Resources','stem','rover',79.99,89.99,4.6,8400,680,'amazon','Screen-free coding for tiny humans.','No tablet required — just buttons, cards and a very patient robot.',2019,1,''],
    [26,'vector-2','Vector 2.0','Digital Dream Labs','companion','desk',249.00,299.00,4.1,2600,660,'amazon','The desk robot with Alexa, ChatGPT and opinions.','An always-on companion for adults who like their robots a little grumpy.',2018,7,''],
    [27,'ebo-air-2-plus','Enabot EBO Air 2 Plus','Enabot','pets','orb',349.00,399.00,4.7,780,640,'amazon','The patrol rover for pets, parcels and parents.','A 2K roaming camera that checks the house while you’re out.',2025,2,''],
    [28,'loona-deskmate','Loona DeskMate','KEYi Tech','companion','desk',299.00,329.00,4.3,420,620,'meta,amazon','Your iPhone, now with a neck and a personality.','Turns your phone into a desk-side AI coworker that nods along.',2026,4,'New'],
    [29,'pophie','Pophie','Robie','companion','desk',299.00,399.00,4.3,310,600,'meta','A desk creature with two LCD eyes and a long memory.','The CES darling that remembers your stories and asks follow-up questions.',2026,3,'New'],
    [30,'lovipeer','loviPeer','LOVEAXI','companion','plush',99.00,129.00,4.4,1400,580,'tiktok,amazon','A $99 plush that speaks fluent kid.','A soft, screen-eyed companion with full-duplex conversation and bedtime stories.',2025,5,''],
    [31,'bittle-x','Petoi Bittle X','Petoi','dogs','quad',299.00,329.00,4.5,620,560,'amazon','A palm-sized robot dog you can actually program.','Open-source, hackable and sturdy enough for the family room.',2023,4,''],
    [32,'sphero-bolt','Sphero Bolt','Sphero','stem','orb',179.00,199.00,4.6,3900,540,'amazon','The coding orb that taught a generation to roll.','A programmable ball with a glowing matrix and proper STEM credentials.',2018,8,''],
    [33,'dash','Wonder Workshop Dash','Wonder Workshop','stem','rover',149.00,179.00,4.5,6100,520,'amazon','The classroom robot that makes coding a game.','A wheeled sidekick with a decade of lesson plans behind it.',2015,2,''],
    [34,'luka-hero-s','Luka Hero S','Ling','companion','screen',299.00,329.00,4.6,1800,500,'amazon','The reading robot that points at every word.','A patient reading coach for bilingual households.',2022,5,''],
    [35,'moxie','Moxie','Embodied','companion','screen',799.00,899.00,4.1,1100,480,'amazon,meta','The kid companion with a cult following and a comeback story.','A screen-faced friend built around social-emotional learning.',2020,4,''],
    [36,'furreal-cubby','FurReal Cubby','Hasbro','pets','plush',199.00,229.00,4.5,4300,460,'amazon','A plush bear that naps, sniffs and asks for more.','The cuddly gateway drug to robot pets.',2022,5,''],
    [37,'bitzee','Bitzee','Spin Master','pets','orb',29.99,34.99,4.3,9800,450,'amazon,tiktok','A digital pet you can actually touch.','A palm-sized pod pet that lives in your hand, no app required.',2023,3,''],
    [38,'dji-mini-4k','DJI Mini 4K','DJI','rc','drone',299.00,329.00,4.7,3900,440,'amazon,meta','The beginner drone that shoots like a pro.','4K, 31 minutes of flight, and a foldable body that fits a jacket pocket.',2024,7,''],
    [39,'unitree-go2','Unitree Go2','Unitree','dogs','quad',1368.00,1599.00,4.4,900,430,'amazon,meta','A real quadruped, now in your living room.','The consumer robot dog that walks, trots and follows you around.',2023,7,'Premium'],
    [40,'mbot2','mBot2','Makeblock','stem','rover',119.99,139.99,4.5,2100,420,'amazon','A proper STEM kit that survives the classroom.','Build it, code it, then add sensors until it does something ridiculous.',2021,0,''],
    [41,'ozobot-evo','Ozobot Evo','Ozobot','stem','orb',99.99,119.99,4.3,1600,400,'amazon','A line-following robot with a social life.','Draw a path, code a colour sequence, and watch it improvise.',2017,4,''],
    [42,'lepro-ami','Lepro Ami','Lepro','companion','screen',249.00,299.00,4.2,180,390,'meta','A 3D avatar that lives on your desk.','A curved OLED companion with eye tracking and a very calm vibe.',2026,6,'New'],
    [43,'lovot-3','LOVOT 3.0','Groove X','companion','plush',3300.00,3500.00,4.7,640,380,'meta','The $3,300 robot that just wants to be loved.','Warm, needy and deliberately useless — the luxury benchmark for companionship.',2023,6,'Premium'],
    [44,'lilmilo','ECOVACS LilMilo','ECOVACS','companion','dog',799.99,849.00,4.4,260,370,'meta,amazon','A fluffy puppy with a local LLM and a warm tummy.','ECOVACS’ emotional pet: 38°C, 40+ sensors, zero walks.',2026,5,'New'],
    [45,'ebo-max','Enabot EBO Max','Enabot','pets','orb',549.00,599.00,4.4,240,360,'amazon,meta','The family rover with a body and a brain.','A 2026 flagship that patrols, talks and remembers the house.',2026,2,'New'],
    [46,'stackchan','StackChan','M5Stack','companion','desk',189.00,209.00,4.5,510,350,'meta','The open-source desk bot with a face you can hack.','A maker-friendly companion that nods, blinks and runs your code.',2023,1,'Indie'],
    [47,'coding-critters','Coding Critters','Learning Resources','stem','rover',39.99,44.99,4.7,7600,340,'amazon','Coding for four-year-olds, no screen required.','A storybook, a pet and a tiny robot that follows instructions.',2017,3,''],
    [48,'bittle','Petoi Bittle','Petoi','dogs','quad',249.00,279.00,4.4,480,330,'amazon','The open-source robot dog for curious builders.','A serious quadruped platform at a hobbyist price.',2021,4,''],
    [49,'apitor-robot-x','Apitor Robot X','Apitor','stem','rover',99.99,119.99,4.5,3100,320,'amazon','20 builds, one box, zero screens.','A STEM kit that turns into a rover, a crane and a very good excuse for mess.',2020,0,''],
    [50,'hoverair-x1','HoverAir X1','HoverAir','rc','drone',349.00,399.00,4.4,1200,310,'amazon,meta','The self-flying camera that fits in a pocket.','No controller, no app fumbling — launch it and it films you.',2023,7,''],
    [51,'ryze-tello','Ryze Tello','Ryze','rc','drone',99.00,109.00,4.4,5200,300,'amazon','The $99 drone that makes flying feel easy.','A gentle, reliable first drone with a surprising amount of charm.',2018,2,''],
    [52,'dji-mini-4-pro','DJI Mini 4 Pro','DJI','rc','drone',759.00,799.00,4.7,2800,290,'amazon','The tiny drone with obstacle avoidance and big ambitions.','The sweet spot for travellers who want pro footage without a backpack.',2023,7,'Premium'],
    [53,'robosen-k1','Robosen K1','Robosen','stem','humanoid',399.00,449.00,4.3,700,280,'amazon,meta','A programmable humanoid that walks and talks.','A real bipedal robot for the price of a laptop.',2022,8,''],
    [54,'clicbot','ClicBot','KEYi Tech','stem','arm',399.00,449.00,4.4,1300,270,'amazon','A modular robot that becomes whatever you build.','Clicks together like LEGO, moves like a small creature.',2020,4,''],
    [55,'wonder-cue','Wonder Workshop Cue','Wonder Workshop','stem','rover',199.00,219.00,4.4,1400,260,'amazon','The coding companion for tweens who roll their eyes.','A chatty, app-connected robot with a genuinely good curriculum.',2018,2,''],
    [56,'mbot-ranger','mBot Ranger','Makeblock','stem','rover',149.00,169.00,4.4,1900,250,'amazon','A three-in-one STEM rover.','Tank, trike or self-balancing — build the one you want.',2016,0,''],
    [57,'little-live-puppy','Little Live Pets My Puppy','Moose Toys','pets','plush',49.99,54.99,4.3,5100,245,'amazon','A plush puppy that follows you home.','Soft, silly and surprisingly interactive for the price.',2022,3,''],
    [58,'furreal-peanut','FurReal Peanut','Hasbro','pets','plush',39.99,44.99,4.5,4600,240,'amazon','A pocket-sized primate with a big appetite.','Feeds, burps and giggles — the ultimate low-stakes pet.',2021,5,''],
    [59,'tombot-jennie','Tombot Jennie','Tombot','pets','plush',1499.00,1599.00,4.6,320,235,'meta','A golden retriever puppy for memory-care residents.','Purpose-built for dementia care, with no cameras and no cloud.',2021,5,'Premium'],
    [60,'joy-for-all-cat','Joy for All Companion Cat','Ageless Innovation','pets','plush',129.99,149.99,4.5,6700,230,'amazon','A purring companion for quiet afternoons.','A soft, responsive cat designed for older adults and their families.',2015,5,''],
    [61,'ebo-x','Enabot EBO X','Enabot','pets','orb',999.00,1099.00,4.3,410,225,'amazon','The $999 family robot with a 4K eye.','Patrols, watches, talks and calls for help — the Swiss Army knife of rovers.',2023,2,''],
    [62,'sony-aibo','Sony Aibo','Sony','dogs','quad',2899.00,2999.00,4.6,1500,220,'amazon,meta','The robot dog with a 25-year legacy.','Aibo learns your household and develops a one-of-a-kind personality.',2018,7,'Premium'],
    [63,'robomaster-s1','DJI RoboMaster S1','DJI','stem','rover',549.00,599.00,4.5,1600,215,'amazon','A battle bot for people who like engineering.','Mecanum wheels, a blaster and a proper SDK.',2019,8,''],
    [64,'sphero-bolt-plus','Sphero BOLT+','Sphero','stem','orb',249.00,269.00,4.6,380,210,'amazon','The classroom classic, upgraded.','A brighter matrix, longer range and more sensors for serious tinkering.',2024,8,'New'],
    [65,'sphero-rvr-plus','Sphero RVR+','Sphero','stem','rover',249.00,269.00,4.5,620,205,'amazon','A rover you can build on.','A hackable, all-terrain platform for Raspberry Pi and Arduino projects.',2022,8,''],
    [66,'lego-spike-essential','LEGO Education SPIKE Essential','LEGO Education','stem','arm',274.00,299.00,4.6,740,200,'amazon','LEGO’s classroom starter kit.','Bricks, motors and a gentle introduction to computational thinking.',2021,1,''],
    [67,'lego-mindstorms','LEGO Mindstorms Robot Inventor','LEGO','stem','arm',399.00,429.00,4.6,3300,195,'amazon','The LEGO robotics set for ambitious builders.','Five builds, one hub and a proper coding environment.',2020,1,''],
    [68,'robosen-optimus','Robosen Optimus Prime','Robosen','rc','humanoid',699.00,749.00,4.4,1800,190,'amazon,meta','A transforming robot with a remote control.','The truck-to-robot party trick, now app-assisted.',2021,8,''],
    [69,'amagami-ham-ham','Amagami Ham Ham','Yukai Engineering','pets','plush',39.99,49.99,4.2,880,185,'tiktok,meta','A tiny robot that gently nibbles your finger.','The weirdly soothing Japanese desk toy that went viral.',2022,0,'Viral'],
    [70,'punirunes','Punirunes','Bandai','pets','orb',39.99,44.99,4.2,2500,180,'amazon','A squishy digital pet you can poke.','A tactile twist on the Tamagotchi formula.',2022,3,''],
    [71,'hatchimals-alive','Hatchimals Alive','Spin Master','pets','plush',49.99,54.99,4.4,3400,175,'amazon','Hatch, feed, repeat.','The surprise-hatch play pattern that still sells out at Christmas.',2022,3,''],
    [72,'roboraptor-x','WowWee Roboraptor X','WowWee','dogs','quad',99.99,119.99,4.3,2600,170,'amazon','A dinosaur with a bad attitude and a remote.','The toy-aisle legend, back with more sensors and louder roars.',2023,0,''],
    [73,'jimu-robot','UBTECH JIMU Robot','UBTECH','stem','arm',99.99,119.99,4.3,1900,165,'amazon','Build a robot, code a robot, battle a robot.','A block-based kit with proper servos and an app.',2017,8,''],
    [74,'apitor-superbot','Apitor SuperBot','Apitor','stem','rover',69.99,79.99,4.4,2200,160,'amazon','18 builds for the price of a takeaway.','A budget STEM kit that doesn’t feel like a budget STEM kit.',2019,0,''],
    [75,'arduino-alvik','Arduino Alvik','Arduino','stem','rover',79.99,89.99,4.5,340,155,'amazon','Arduino’s first robot for beginners.','A friendly, well-documented rover for learning real code.',2024,2,'New'],
    [76,'mtiny','mTiny','Makeblock','stem','rover',149.00,169.00,4.4,680,150,'amazon','A screen-free coding robot for little hands.','A tap-and-go map kit for preschoolers.',2019,0,''],
    [77,'vtech-myla','VTech Myla','VTech','pets','plush',99.99,109.99,4.3,1200,145,'amazon','A plush pet with a bedtime routine.','Soft, interactive and designed for the under-six crowd.',2022,3,''],
    [78,'beatbo','Fisher-Price BeatBo','Fisher-Price','rc','humanoid',49.99,54.99,4.6,6100,140,'amazon','The dancing toddler DJ.','A developmental toy that turns tummy time into a disco.',2014,2,''],
    [79,'star-wars-do','Star Wars D-O','Hasbro','rc','rover',69.99,79.99,4.5,2100,135,'amazon','The galaxy’s most anxious little droid.','A remote-control droid with a very expressive head.',2019,5,''],
    [80,'star-wars-bb8','Star Wars BB-8','Sphero','rc','orb',99.99,119.99,4.4,3200,130,'amazon','The rolling droid that stole the sequel.','A proper app-controlled BB-8 with a magnetic head.',2015,5,''],
    [81,'transformers-optimus-rc','Transformers Optimus Prime RC','Jada Toys','rc','humanoid',59.99,69.99,4.3,1500,125,'amazon','A truck, a robot and a remote.','The classic convert-and-roll play pattern.',2021,8,''],
    [82,'hexbug-battlebots','HEXBUG BattleBots Arena','HEXBUG','rc','rover',79.99,89.99,4.5,4200,120,'amazon','Build, battle, repeat.','A complete arena set for the family’s first robot fight.',2020,0,''],
    [83,'sharper-image-robo-dog','Sharper Image RC Robo Dog','Sharper Image','dogs','dog',39.99,49.99,4.1,980,115,'amazon','A budget pup with a lot of bark.','The mall-toy classic that walks, barks and flips.',2022,0,''],
    [84,'robosen-grimlock','Robosen Grimlock','Robosen','dogs','quad',1499.00,1599.00,4.5,410,110,'meta','A $1,500 robot dinosaur that transforms itself.','The collector-grade showpiece with servo-driven everything.',2023,7,'Premium'],
    [85,'cyberdog-2','CyberDog 2','Xiaomi','dogs','quad',1499.00,1699.00,4.2,260,105,'meta','Xiaomi’s open-source quadruped.','A serious robotics platform in a very shiny package.',2023,7,'Indie'],
    [86,'unitree-go2-pro','Unitree Go2 Pro','Unitree','dogs','quad',1999.00,2199.00,4.5,390,100,'meta','The quadruped that runs, jumps and maps.','A proper research-grade dog for people who want to go deeper.',2023,7,'Premium'],
    [87,'elliq-3','ElliQ 3','Intuition Robotics','companion','screen',249.00,299.00,4.5,280,95,'meta','The companion robot with a healthcare business model.','A proactive desk companion designed for older adults.',2023,6,'Subscription'],
    [88,'zoomer-pup','Zoomer Playful Pup','Spin Master','pets','dog',99.99,109.99,4.4,2900,90,'amazon','A puppy that learns tricks and talks back.','A classic interactive pup with voice commands.',2019,1,''],
    [89,'zoomer-kitty','Zoomer Kitty','Spin Master','pets','plush',79.99,89.99,4.3,1800,85,'amazon','A sassy robot cat with a mind of its own.','Purrs, pounces and ignores you on schedule.',2019,3,''],
    [90,'pets-alive-puppy','Pets Alive Walking Puppy','Idea Nuova','pets','plush',39.99,44.99,4.2,1300,80,'amazon','A wiggly, walkable plush pup.','The budget-friendly intro to robot pets.',2021,5,''],
    [91,'kid-connection-robo-dog','Kid Connection Robo Dog','Kid Connection','dogs','dog',24.99,29.99,4.0,760,75,'amazon','A no-frills robot dog for little hands.','Cheap, cheerful and surprisingly hard to break.',2022,0,''],
    [92,'liberty-rc-dog','Liberty Imports RC Robot Dog','Liberty Imports','dogs','dog',29.99,34.99,4.1,640,70,'amazon','A remote-control dog with a light-up face.','The birthday-party hit that doesn’t need an app.',2021,2,''],
    [93,'pidog','Waveshare PiDog','Waveshare','dogs','quad',199.00,219.00,4.4,210,65,'meta','A Raspberry Pi robot dog for makers.','An open-source quadruped that teaches real robotics.',2024,4,'Indie'],
    [94,'emo-go-home','EMO Go Home','Living.AI','companion','desk',369.00,399.00,4.4,690,60,'amazon','EMO, but with a home of its own.','Adds a charging dock and laser navigation to the desk-pet formula.',2023,7,''],
    [95,'codey-rocky','Codey Rocky','Makeblock','stem','rover',99.99,109.99,4.4,900,55,'amazon','A coding robot that fits in a pencil case.','A gentle intro to block coding and sensors.',2018,0,''],
    [96,'wonder-dot','Wonder Workshop Dot','Wonder Workshop','stem','orb',49.99,59.99,4.2,700,50,'amazon','The brainy sidekick to Dash.','A creative coding toy with a very good personality.',2015,2,''],
    [97,'sphero-indi','Sphero Indi','Sphero','stem','rover',129.99,149.99,4.5,380,45,'amazon','Screen-free coding for the preschool set.','A colour-card robot that teaches sequencing through play.',2022,8,''],
    [98,'vtech-jotbot','VTech JotBot','VTech','stem','rover',49.99,54.99,4.3,820,40,'amazon','A drawing robot that teaches handwriting.','A patient, screen-free drawing buddy for early learners.',2021,3,''],
    [99,'furreal-walkalots','FurReal Walkalots Big Wags','Hasbro','pets','plush',39.99,44.99,4.4,1900,38,'amazon','A plush pup that actually walks on a leash.','The toddler-friendly intro to walking a dog.',2018,5,''],
    [100,'little-live-curlee','Little Live Pets Curlee','Moose Toys','pets','plush',34.99,39.99,4.3,1100,35,'amazon','A curly-haired plush pet with a surprise.','A soft, collectible pet with a hidden surprise inside.',2022,3,'']
  ];

  const CATEGORIES = [
    { id: 'companion', name: 'Desktop companions', zh: '桌面陪伴机器人', blurb: 'Desk-sized friends with faces, feelings and opinions.', tone: 0 },
    { id: 'pets', name: 'Pets & plush', zh: '电子宠物与毛绒', blurb: 'Soft, responsive companions that never need a vet.', tone: 3 },
    { id: 'dogs', name: 'Robot dogs', zh: '机器狗', blurb: 'Four legs, real movement, zero muddy paws.', tone: 7 },
    { id: 'stem', name: 'STEM & coding', zh: 'STEM 编程', blurb: 'Build it, code it, take it apart, build it again.', tone: 2 },
    { id: 'rc', name: 'Drones & RC', zh: '无人机与遥控', blurb: 'Fly, race, battle and film the whole thing.', tone: 4 }
  ];

  const PLATFORMS = {
    amazon: { name: 'Amazon', short: 'AMZ' },
    tiktok: { name: 'TikTok Shop', short: 'TT' },
    meta: { name: 'Meta Shops', short: 'META' }
  };

  const TONES = [
    { bg: '#FFD9CF', body: '#FF6B57', deep: '#C53A28', eye: '#D8FF3F', name: 'Coral' },
    { bg: '#EDF7C2', body: '#C7EE3E', deep: '#6E8A13', eye: '#D8FF3F', name: 'Acid' },
    { bg: '#D8E7FF', body: '#8FB8FF', deep: '#2F4BFF', eye: '#B9D9FF', name: 'Sky' },
    { bg: '#FFE0E8', body: '#FFA7BE', deep: '#C23D63', eye: '#FFC7D6', name: 'Blush' },
    { bg: '#E9DFFF', body: '#B99CFF', deep: '#5D34C8', eye: '#D8FF3F', name: 'Lilac' },
    { bg: '#FFF0C9', body: '#FFD46B', deep: '#B47A00', eye: '#FFE9A8', name: 'Butter' },
    { bg: '#D8F5E8', body: '#7DDDBB', deep: '#087A60', eye: '#7DDDBB', name: 'Mint' },
    { bg: '#E5E1D8', body: '#9C978B', deep: '#2C2924', eye: '#D8FF3F', name: 'Graphite' },
    { bg: '#FFE2CD', body: '#FFA36C', deep: '#C2541F', eye: '#B9D9FF', name: 'Tangerine' }
  ];

  const DEFAULTS = {
    companion: { age: '14+ (some 6+)', battery: '6–10 hours', connectivity: 'Wi-Fi + BLE', sub: 'None' },
    pets: { age: '3+', battery: '4–8 hours', connectivity: 'Wi-Fi (selected models)', sub: 'None' },
    dogs: { age: '8+', battery: '1–3 hours', connectivity: 'Wi-Fi + BLE', sub: 'None' },
    stem: { age: '8+', battery: '3–6 hours', connectivity: 'BLE + USB', sub: 'None' },
    rc: { age: '6+', battery: '20–31 min flight / 2 hrs', connectivity: '2.4 GHz RC + app', sub: 'None' }
  };

  const OVERRIDES = {
    'bubblepal': { age: '3–8', battery: '4 hours', connectivity: 'Wi-Fi', sub: 'Optional content plan' },
    'miko-mini': { age: '5–12', battery: '4–6 hours', connectivity: 'Wi-Fi', sub: 'Miko Max $14.99/mo' },
    'miko-3': { age: '5–12', battery: '5–7 hours', connectivity: 'Wi-Fi', sub: 'Miko Max $14.99/mo' },
    'moxie': { age: '5–10', battery: 'Mains power', connectivity: 'Wi-Fi', sub: 'Legacy $39/mo plan' },
    'elliq-3': { age: '65+', battery: 'Mains power', connectivity: 'Wi-Fi', sub: 'From $49/mo + setup' },
    'lovot-3': { age: 'All ages', battery: 'Mains / dock', connectivity: 'Wi-Fi', sub: 'From $65/mo' },
    'luka-mini': { age: '3–8', battery: '5 hours', connectivity: 'Wi-Fi', sub: 'Optional book library' },
    'luka-hero-s': { age: '3–8', battery: '5 hours', connectivity: 'Wi-Fi', sub: 'Optional book library' },
    'tamagotchi-uni': { age: '6+', battery: '3 days', connectivity: 'Wi-Fi', sub: 'None' },
    'loona': { age: '6+', battery: '40–90 min', connectivity: 'Wi-Fi', sub: 'None' },
    'ebo-se': { age: 'All ages', battery: '2–3 hours', connectivity: 'Wi-Fi', sub: 'Optional cloud storage' },
    'ebo-air-2': { age: 'All ages', battery: '2–3 hours', connectivity: 'Wi-Fi', sub: 'Optional cloud storage' },
    'ebo-x': { age: 'All ages', battery: '2–3 hours', connectivity: 'Wi-Fi', sub: 'Optional cloud storage' },
    'unitree-go2': { age: '16+', battery: '2–4 hours', connectivity: 'Wi-Fi + BLE', sub: 'None' },
    'unitree-go2-pro': { age: '16+', battery: '2–4 hours', connectivity: 'Wi-Fi + BLE', sub: 'None' },
    'sony-aibo': { age: '16+', battery: '2 hours', connectivity: 'Wi-Fi + LTE', sub: 'Optional AI plan' },
    'dji-neo': { age: '16+', battery: '18 min flight', connectivity: 'Wi-Fi + RC-N3', sub: 'None' },
    'dji-mini-4k': { age: '16+', battery: '31 min flight', connectivity: 'Wi-Fi + RC', sub: 'None' },
    'dji-mini-4-pro': { age: '16+', battery: '34 min flight', connectivity: 'Wi-Fi + RC 2', sub: 'None' },
    'hoverair-x1': { age: '16+', battery: '11 min flight', connectivity: 'Wi-Fi', sub: 'None' }
  };

  const PRODUCTS = RAW.map(function (r) {
    const cat = r[4];
    const spec = Object.assign({}, DEFAULTS[cat], OVERRIDES[r[1]] || {});
    return {
      rank: r[0],
      id: r[1],
      name: r[2],
      brand: r[3],
      cat: cat,
      form: r[5],
      price: r[6],
      compareAt: r[7] || null,
      rating: r[8],
      reviews: r[9],
      units: r[10],
      platforms: r[11].split(','),
      tagline: r[12],
      note: r[13],
      year: r[14],
      tone: r[15],
      badge: r[16] || '',
      spec: spec,
      colors: [
        { name: TONES[r[15]].name, hex: TONES[r[15]].body },
        { name: 'Graphite', hex: '#2C2924' },
        { name: 'Bone', hex: '#EFE9DC' }
      ]
    };
  });

  const DATA = {
    products: PRODUCTS,
    categories: CATEGORIES,
    platforms: PLATFORMS,
    tones: TONES,
    updated: '2026-11-01',
    byId: function (id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0] || null; },
    byCat: function (cat) { return PRODUCTS.filter(function (p) { return p.cat === cat; }); },
    top: function (n) { return PRODUCTS.slice(0, n || 10); }
  };

  // Real product photography (demo pack). Replace with authorized brand assets
  // before accepting live orders; every entry carries its source and rights status.
  const IMAGES = {
    eilik: {
      files: ['assets/products/eilik/01.webp', 'assets/products/eilik/02.webp'],
      alt: 'Eilik desktop companion robot waving',
      source: 'https://energizelab.com/consumerview/eilik',
      credit: 'Energize Lab',
      rights: 'official-demo'
    },
    eiliko: {
      files: ['assets/products/eiliko/01.webp'],
      alt: 'Eiliko pocket companion robot',
      source: 'https://energizelab.com/consumerview/eiliko',
      credit: 'Energize Lab',
      rights: 'official-demo'
    },
    loona: {
      files: ['assets/products/loona/01.webp'],
      alt: 'Loona AI robot dog with charging dock',
      source: 'https://keyirobot.com/products/loona',
      credit: 'KEYi Tech',
      rights: 'official-demo'
    },
    emo: {
      files: ['assets/products/emo/01.webp'],
      alt: 'EMO AI desktop robot',
      source: 'https://living.ai/product/emo/',
      credit: 'Living.AI',
      rights: 'official-demo'
    },
    aibi: {
      files: ['assets/products/aibi/01.webp'],
      alt: 'AIBI Pocket Pet wearable robot',
      source: 'https://living.ai/aibi/',
      credit: 'Living.AI',
      rights: 'official-demo'
    },
    moflin: {
      files: ['assets/products/moflin/01.webp'],
      alt: 'Casio Moflin furry AI companion held in a hand',
      source: 'https://www.casio.com/us/moflin/',
      credit: 'Casio',
      rights: 'official-demo',
      layout: 'lifestyle',
      bg: '#C9D6DA'
    },
    'joy-for-all-pup': {
      files: ['assets/products/joy-for-all-pup/01.webp'],
      alt: 'Joy for All golden companion pup with red bandana',
      source: 'https://joyforall.com/products/companion-pet-pup',
      credit: 'Ageless Innovation',
      rights: 'official-demo',
      bg: '#FFFFFF'
    },
    'miko-3': {
      files: ['assets/products/miko-3/01.webp'],
      alt: 'Miko 3 AI robot for kids',
      source: 'https://miko.ai/products/miko-3',
      credit: 'Miko',
      rights: 'official-demo'
    },
    'miko-mini': {
      files: ['assets/products/miko-mini/01.webp'],
      alt: 'Miko Mini AI robot for kids',
      source: 'https://miko.ai/products/miko-mini',
      credit: 'Miko',
      rights: 'official-demo'
    },
    'sphero-bolt': {
      files: ['assets/products/sphero-bolt/01.webp'],
      alt: 'Sphero BOLT programmable robot ball',
      source: 'https://sphero.com/products/bolt',
      credit: 'Sphero',
      rights: 'official-demo'
    },
    'sphero-mini': {
      files: ['assets/products/sphero-mini/01.webp'],
      alt: 'Sphero Mini robot ball',
      source: 'https://sphero.com/products/sphero-mini',
      credit: 'Sphero',
      rights: 'official-demo'
    },
    'dji-neo': {
      files: ['assets/products/dji-neo/01.webp'],
      alt: 'DJI Neo palm-sized drone',
      source: 'https://www.dji.com/neo',
      credit: 'DJI',
      rights: 'official-demo'
    }
  };

  // Only photo-ready, authorized-candidate SKUs are open for checkout.
  // The rest stay in the 100 index as browse-only until their assets clear.
  PRODUCTS.forEach(function (p) {
    const m = IMAGES[p.id];
    p.launch = !!(m && m.files && m.files.length);
    p.photoReady = p.launch;
  });
  DATA.launch = PRODUCTS.filter(function (p) { return p.launch; });
  DATA.launchCount = DATA.launch.length;

  DATA.images = IMAGES;
  global.BOTIQUE_IMAGES = IMAGES;
  global.BOTIQUE_DATA = DATA;
  if (typeof module !== 'undefined' && module.exports) module.exports = DATA;
})(typeof window !== 'undefined' ? window : globalThis);
