const Module = require('./Module.js');
const { Configuration, OpenAIApi } = require('openai');
const mailchimp = require('@mailchimp/mailchimp_transactional');

const EXAMPLE_MEALS = [
  {"name":"Lemon Cream Tortellini & Broccoli with Garlicky Green Beans & Red Bell Peppers","websiteUrl":"https://factor-us-development.myshopify.com/products/lemon-cream-tortellini-broccoli-with-garlicky-green-beans-red-bell-peppers","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_LemonCreamTortellini_Broccoli2022_Plated_WhiteLabel.jpg?v=1677026103"},
  {"name":"Vegetable Ratatouille with Mascarpone Polenta","websiteUrl":"https://factor-us-development.myshopify.com/products/vegetable-ratatouille-with-mascarpone-polenta-1","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLVegetableRatatouille_3db05dc1-c657-47d3-b89e-664ca6262daa.jpg?v=1677025935"},
  {"name":"Almond Crusted Salmon with Red Pepper Cream, Green Beans & Feta Dressing","websiteUrl":"https://factor-us-development.myshopify.com/products/almond-crusted-salmon-with-red-pepper-cream-green-beans-feta-dressing","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_AlmondCrustedSalmon_2022_Plated_ALT_WhiteLabel.jpg?v=1677025764"},
  {"name":"Cheesy Smothered Pork Chop with Butternut Squash Mash, Roasted Potatoes & Carrots","websiteUrl":"https://factor-us-development.myshopify.com/products/cheesy-smothered-pork-chop-with-butternut-squash-mash-roasted-potatoes-carrots","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_CheesySmotheredPorkChop_2022_Plated_WhiteLabel.jpg?v=1677025598"},
  {"name":"Turkey Sloppy Joe with Cheddar Corn Casserole & Honey Garlic Brussels","websiteUrl":"https://factor-us-development.myshopify.com/products/turkey-sloppy-joe-with-cheddar-corn-casserole-honey-garlic-brussels","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_TurkeySloppyJoe_2022_Plated_WhiteLabel.jpg?v=1677025445"},
  {"name":"Roasted Garlic Braised Beef with Ranch Mashed Potatoes, Broccoli & Cauliflower","websiteUrl":"https://factor-us-development.myshopify.com/products/roasted-garlic-braised-beef-with-ranch-mashed-potatoes-broccoli-cauliflower","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLRoastedGarlicBraisedBeef.jpg?v=1677025329"},
  {"name":"Thai Almond Chicken with Sweet Potato Noodles & Spicy Thai Cabbage","websiteUrl":"https://factor-us-development.myshopify.com/products/thai-almond-chicken-with-sweet-potato-noodles-spicy-thai-cabbage","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLThaiAlmondChicken.jpg?v=1677025165"},
  {"name":"Mushroom Chicken Thighs & Wild Rice with Garlic-Roasted Green Beans","websiteUrl":"https://factor-us-development.myshopify.com/products/mushroom-chicken-thighs-wild-rice-with-garlic-roasted-green-beans","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_MushroomChickenThighs_WildRice_2022_Plated_WhiteLabel.jpg?v=1677024945"},
  {"name":"Creamy Tomato Sausage & Kale Pasta with Roasted Pearl Onions","websiteUrl":"https://factor-us-development.myshopify.com/products/creamy-tomato-sausage-kale-pasta-with-roasted-pearl-onions","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_CreamyTomatoSausageAndKalePasta_2022_Plated_WhiteLabel.jpg?v=1677024711"},
  {"name":"Fiesta Grilled Chicken with Hominy-Tomato Sauce & Elote-Style Squash","websiteUrl":"https://factor-us-development.myshopify.com/products/fiesta-grilled-chicken-with-hominy-tomato-sauce-elote-style-squash","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLFiestaGrilledChicken.jpg?v=1677024589"},
  {"name":"Chipotle-Rubbed Pork Chop with Roasted Cabbage & Red Bell Pepper Fondue","websiteUrl":"https://factor-us-development.myshopify.com/products/chipotle-rubbed-pork-chop-with-roasted-cabbage-red-bell-pepper-fondue-1","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_ChipotleRubbedPorkChop_2022_Plated_WhiteLabel_81698d39-76db-4d31-baca-8b331c35742d.jpg?v=1677024345"},
  {"name":"Cheesy Garden Herb Chicken with Creamy Broccoli Rice & Chile Garlic Zucchini","websiteUrl":"https://factor-us-development.myshopify.com/products/cheesy-garden-herb-chicken-with-creamy-broccoli-rice-chile-garlic-zucchini","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_CheesyGardenHerbChicken_2022_Plated_WhiteLabel.jpg?v=1677024142"},
  {"name":"Buffalo Chicken Breast with Pepper Jack Cauliflower Mash, Broccoli & Ranch Dressing","websiteUrl":"https://factor-us-development.myshopify.com/products/buffalo-chicken-breast-with-pepper-jack-cauliflower-mash-broccoli-ranch-dressing","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/OptimizedWLBuffaloChickenBreast.jpg?v=1677023773"},
  {"name":"Pulled Chicken Chili Verde with White Beans, Poblano Corn Salad & Cilantro Crema","websiteUrl":"https://factor-us-development.myshopify.com/products/pulled-chicken-chili-verde-with-white-beans-poblano-corn-salad-cilantro-crema-1","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_PulledChickenChiliVerde_2022_Plated_WhiteLabel_a6cba920-f432-4202-8aec-1bc760c2eaf5.jpg?v=1677023103"},
  {"name":"Pulled Chicken Chili Verde with White Beans, Poblano Corn Salad & Cilantro Crema","websiteUrl":"https://factor-us-development.myshopify.com/products/pulled-chicken-chili-verde-with-white-beans-poblano-corn-salad-cilantro-crema","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_PulledChickenChiliVerde_2022_Plated_WhiteLabel.jpg?v=1677022793"},
  {"name":"Shredded Chicken & Mushroom Cavatappi with Garlic Spinach & Creamy White Wine Sauce","websiteUrl":"https://factor-us-development.myshopify.com/products/shredded-chicken-mushroom-cavatappi-with-garlic-spinach-creamy-white-wine-sauce","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_ShreddedChickenAndMushroomCavatappi_2022_Plated_WhiteLabel.jpg?v=1677021702"},
  {"name":"Smoky Ancho Chile Braised Beef with Green Chile Rice, Cauliflower Fundido & Roasted Tomato Relish","websiteUrl":"https://factor-us-development.myshopify.com/products/smoky-ancho-chile-braised-beef-with-green-chile-rice-cauliflower-fundido-roasted-tomato-relish","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_SmokyAnchoChileBraisedBeef_2022_Plated_WhiteLabel.jpg?v=1677021630"},
  {"name":"Jalapeño Beef Mac & Cheese with Broccoli & Poblano Rajas","websiteUrl":"https://factor-us-development.myshopify.com/products/jalapeno-beef-mac-cheese-with-broccoli-poblano-rajas","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLJalapenoBeefMac_Cheese.jpg?v=1677021445"},
  {"name":"Tomato Cream & Rosemary Chicken Fusilli with Broccoli & Cauliflower topped with Honey Butter","websiteUrl":"https://factor-us-development.myshopify.com/products/tomato-cream-rosemary-chicken-fusilli-with-broccoli-cauliflower-topped-with-honey-butter","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_TomatoCream_RosemaryChickenFusilli_2022_Plated_WhiteLabel.jpg?v=1677021311"},
  {"name":"Chive & Garlic Chicken with Creamy Cheddar Mash, Green Beans & Mushrooms","websiteUrl":"https://factor-us-development.myshopify.com/products/chive-garlic-chicken-with-creamy-cheddar-mash-green-beans-mushrooms-1","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLChive_GarlicChicken_886b848c-56cf-4f44-8083-4700fa4bc962.jpg?v=1676960908"},
  {"name":"Red Pepper Queso Chicken with Brown Rice & Rajas","websiteUrl":"https://factor-us-development.myshopify.com/products/red-pepper-queso-chicken-with-brown-rice-rajas","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLRedPepperQuesoChicken.jpg?v=1676960727"},
  {"name":"BBQ Pork Sloppy Joe with Chipotle Sweet Potato Mash & Roasted Green Beans","websiteUrl":"https://factor-us-development.myshopify.com/products/bbq-pork-sloppy-joe-with-chipotle-sweet-potato-mash-roasted-green-beans","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLBbqPorkSloppyJoe.jpg?v=1676960606"},
  {"name":"Roasted Red Pepper & Parmesan Chicken with Olive Chimichurri Cauliflower","websiteUrl":"https://factor-us-development.myshopify.com/products/roasted-red-pepper-parmesan-chicken-with-olive-chimichurri-cauliflower","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLRoastedRedPepper_ParmesanChicken_2022_Plated_WhiteLabel.jpg?v=1676960284"},
  {"name":"Cheesy Ground Beef & Cabbage with Chile Garlic Green Beans & Red Bell Peppers","websiteUrl":"https://factor-us-development.myshopify.com/products/cheesy-ground-beef-cabbage-with-chile-garlic-green-beans-red-bell-peppers","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_CheesyGroundBeefAndCabbage_2022_Plated_WhiteLabel.jpg?v=1676960086"},
  {"name":"Smothered Mushroom Pork Chop with Cauliflower Mash & Garlic Haricots Verts","websiteUrl":"https://factor-us-development.myshopify.com/products/smothered-mushroom-pork-chop-with-cauliflower-mash-garlic-haricots-verts","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/FABX-HERO_F00626A_SmotheredMushroomPorkChop_2022_Plated_WhiteLabel.jpg?v=1676959807"},
  {"name":"Chicken Piccata with Cauliflower Mash & Broccoli","websiteUrl":"https://factor-us-development.myshopify.com/products/chicken-piccata-with-cauliflower-mash-broccoli","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLChickenPiccata.jpg?v=1676959458"},
  {"name":"Béchamel & Sausage Ragu Mac with Garlic Kale & Onions","websiteUrl":"https://factor-us-development.myshopify.com/products/bechamel-sausage-ragu-mac-with-garlic-kale-onions","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_BechamelAndSausageRaguMac_2022_Plated_WhiteLabel.jpg?v=1676957588"},
  {"name":"Butternut Squash & Sage Chicken Macaroni with Garlic Green Beans & Apple Cranberry Crumble","websiteUrl":"https://factor-us-development.myshopify.com/products/butternut-squash-sage-chicken-macaroni-with-garlic-green-beans-apple-cranberry-crumble-1","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLButternutSquash_SageChickenMacaronijpeg_d0051df6-2907-47d0-be39-ac841127be3d.jpg?v=1676950862"},
  {"name":"Indian-Spiced Vegetables & Tomato Rice with Candied Cinnamon Almonds, Tandoori Carrots & Cilantro-Mint Chutney","websiteUrl":"https://factor-us-development.myshopify.com/products/indian-spiced-vegetables-tomato-rice-with-candied-cinnamon-almonds-tandoori-carrots-cilantro-mint-chutney","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_Indian-SpicedVegetables_TomatoRice2022_Plated_WhiteLabel.jpg?v=1676950676"},
  {"name":"Spinach & Roasted Red Pepper Cream Tortellini with Sauteed Kale, Roasted Mushrooms & Green Beans","websiteUrl":"https://factor-us-development.myshopify.com/products/spinach-roasted-red-pepper-cream-tortellini-with-sauteed-kale-roasted-mushrooms-green-beans","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_Spinach_RoastedRedPepperCreamTortellini_2022_Plated_WhiteLabel.jpg?v=1676950558"},
  {"name":"Biryani Rice with Tandoori Cauliflower & Curry Yogurt","websiteUrl":"https://factor-us-development.myshopify.com/products/biryani-rice-with-tandoori-cauliflower-curry-yogurt","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLBiryaniRice.jpg?v=1676950348"},
  {"name":"Garlic & Herb Roasted Mushrooms with Olive Oil Mash Potatoes, Roasted Green Beans & Tomatoes","websiteUrl":"https://factor-us-development.myshopify.com/products/garlic-herb-roasted-mushrooms-with-olive-oil-mash-potatoes-roasted-green-beans-tomatoes","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLGarlic_HerbMushrooms.jpg?v=1676950218"},
  {"name":"Ancho Lime Salmon with Mexican-Spiced Quinoa, Black Bean Corn Salad & Chimichurri Crema","websiteUrl":"https://factor-us-development.myshopify.com/products/ancho-lime-salmon-with-mexican-spiced-quinoa-black-bean-corn-salad-chimichurri-crema","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLAnchoLimeSalmon.jpg?v=1676950102"},
  {"name":"Jamaican Jerk Shredded Turkey with Coconut Rice & Mango Salsa","websiteUrl":"https://factor-us-development.myshopify.com/products/jamaican-jerk-shredded-turkey-with-coconut-rice-mango-salsa","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_JamaicanJerkShreddedTurkey_2022_Plated_WhiteLabel.jpg?v=1676949964"},
  {"name":"Louisiana Pork Chop with Red Beans and Rice & Okra Maque Choux","websiteUrl":"https://factor-us-development.myshopify.com/products/louisiana-pork-chop-with-red-beans-and-rice-okra-maque-choux","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_LouisianaPorkChop_2022_Plated_WhiteLabel.jpg?v=1676949808"},
  {"name":"Cheesy Chicken & Broccoli Casserole with Brown Jasmine Rice","websiteUrl":"https://factor-us-development.myshopify.com/products/cheesy-chicken-broccoli-casserole-with-brown-jasmine-rice","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_CheesyChicken_BroccoliCasserole_2022_Plated_WhiteLabel.jpg?v=1676949710"},
  {"name":"Braised Beef & Roasted Red Pepper Mac with Roasted Green Beans","websiteUrl":"https://factor-us-development.myshopify.com/products/braised-beef-roasted-red-pepper-mac-with-roasted-green-beans","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLBraisedBeef_RoastedRedPepperMac.jpg?v=1676949607"},
  {"name":"Red Chile Ground Beef Tamale Bowl with Spicy Black Beans & Cilantro Rice","websiteUrl":"https://factor-us-development.myshopify.com/products/red-chile-ground-beef-tamale-bowl-with-spicy-black-beans-cilantro-rice","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLRedChileGroundBeefTamaleBowl.jpg?v=1676949489"},
  {"name":"Smoky BBQ Chicken Breast with Mashed Potatoes, Creamed Corn & Green Bean Casserole","websiteUrl":"https://factor-us-development.myshopify.com/products/smoky-bbq-chicken-breast-with-mashed-potatoes-creamed-corn-green-bean-casserole","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLSmokyBBQChickenBreast.jpg?v=1676949386"},
  {"name":"Green Chile Chicken with Mexican Cauliflower Rice & Queso Blanco","websiteUrl":"https://factor-us-development.myshopify.com/products/green-chile-chicken-with-mexican-cauliflower-rice-queso-blanco","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLGreenChileChicken.jpg?v=1676949244"},
  {"name":"Cavatappi & Italian Pork Ragu with Garlic Broccoli","websiteUrl":"https://factor-us-development.myshopify.com/products/cavatappi-italian-pork-ragu-with-garlic-broccoli","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/OptimizedWLCavatappi_ItalianPorkRagu.jpg?v=1676949145"},
  {"name":"Chicken & Mushroom Tetrazzini with Garlicky Green Beans","websiteUrl":"https://factor-us-development.myshopify.com/products/chicken-mushroom-tetrazzini-with-garlicky-green-beans","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLChicken_MushroomTetrazzini.jpg?v=1676949035"},
  {"name":"Garlic Butter Shrimp & Creamed Kale with Zucchini-Pepper-Onion Medley","websiteUrl":"https://factor-us-development.myshopify.com/products/garlic-butter-shrimp-creamed-kale-with-zucchini-pepper-onion-medley","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/GarlicButterShrimp_CreamedKale_2022_Plated_WhiteLabel.jpg?v=1676948917"},
  {"name":"Shredded Chicken Thigh Cacciatore with Parmesan Cauliflower “Grits” & Broccoli","websiteUrl":"https://factor-us-development.myshopify.com/products/shredded-chicken-thigh-cacciatore-with-parmesan-cauliflower-grits-broccoli","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_ShreddedChickenThighCacciatore_2022_Plated_WhiteLabel.jpg?v=1676948770"},
  {"name":"Goat Cheese, Mushroom & Onion Burger with Roasted Green Beans & Romesco Butter","websiteUrl":"https://factor-us-development.myshopify.com/products/goat-cheese-mushroom-onion-burger-with-roasted-green-beans-romesco-butter","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_GoatCheese_Mushroom_OnionBurger_2022_Plated_WhiteLabel.jpg?v=1676948654"},
  {"name":"Green Peppercorn Pork Tenderloin with Celery Root-Cauliflower Mash & Haricots Verts","websiteUrl":"https://factor-us-development.myshopify.com/products/green-peppercorn-pork-tenderloin-with-celery-root-cauliflower-mash-haricots-verts","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WHITELABELGreenPeppercornPorkTenderloin.jpg?v=1676948810"},
  {"name":"Ranch Baked Chicken with Cheesy Broccoli Rice & Roasted Mushrooms","websiteUrl":"https://factor-us-development.myshopify.com/products/ranch-baked-chicken-with-cheesy-broccoli-rice-roasted-mushrooms","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLRanchBakedChicken.jpg?v=1676948408"},
  {"name":"Queso Fundido with Cilantro Cauliflower Rice","websiteUrl":"https://factor-us-development.myshopify.com/products/queso-fundido-with-cilantro-cauliflower-rice","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/OptimizedWLQuesoFundido.jpg?v=1676948247"},
  {"name":"Blackened Tofu with Cajun Broccoli, Peppers & Vegan Remoulade","websiteUrl":"https://factor-us-development.myshopify.com/products/blackened-tofu-with-cajun-broccoli-peppers-vegan-remoulade","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_BlackenedTofu_2022_Plated_WhiteLabel.jpg?v=1676943210"},
  {"name":"Vegetable Ratatouille with Mascarpone Polenta","websiteUrl":"https://factor-us-development.myshopify.com/products/vegetable-ratatouille-with-mascarpone-polenta","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLVegetableRatatouille.jpg?v=1676942973"},
  {"name":"Mushroom, Tomato & Goat Cheese Cavatappi with Herb-Roasted Zucchini","websiteUrl":"https://factor-us-development.myshopify.com/products/mushroom-tomato-goat-cheese-cavatappi-with-herb-roasted-zucchini","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_Mushroom_Tomato_GoatCheeseCavatappi_2022_Plated_WhiteLabel.jpg?v=1676942741"},
  {"name":"Creamy Dill Shrimp Pasta with Chile-Spiced Broccoli & Cauliflower","websiteUrl":"https://factor-us-development.myshopify.com/products/creamy-dill-shrimp-pasta","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_CreamyDillShrimpPasta_2022_Plated_WhiteLabel.jpg?v=1676942822"},
  {"name":"Blackened Salmon with Smoked Gouda Cauliflower Grits & Broccoli","websiteUrl":"https://factor-us-development.myshopify.com/products/blackened-salmon-with-smoked-gouda-cauliflower-grits-broccoli","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLBlackenedSalmon.jpg?v=1676942427"},
  {"name":"Artichoke & Chicken Wild Rice Bowl with Corn, Zucchini & Sun-Dried Tomato Garlic Sauce","websiteUrl":"https://factor-us-development.myshopify.com/products/artichoke-chicken-wild-rice-bowl-with-corn-zucchini-sun-dried-tomato-garlic-sauce","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_Artichoke_ChickenWildRiceBowl_2022_Plated_WhiteLabel.jpg?v=1676942284"},
  {"name":"Italian Sausage & Stewed White Beans with Gremolata Green Beans","websiteUrl":"https://factor-us-development.myshopify.com/products/italian-sausage-stewed-white-beans-with-gremolata-green-beans","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_ItalianSausageAndStewedWhiteBeans_2022_Plated_WhiteLabel.jpg?v=1676942168"},
  {"name":"Turkey & Red Pepper-Mushroom Gravy with Broccoli “Stuffing” & Green Beans Amandine","websiteUrl":"https://factor-us-development.myshopify.com/products/turkey-red-pepper-mushroom-gravy-with-broccoli-stuffing-green-beans-amandine","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLTurkey_MushroomRedPepperCream_2022_Plated_WhiteLabel.jpg?v=1676942035"},
  {"name":"Soy Braised Beef with Stir-Fry Veggies & Steamed Broccoli","websiteUrl":"https://factor-us-development.myshopify.com/products/soy-braised-beef-with-stir-fry-veggies-steamed-broccoli","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLSoyBraisedBeef.jpg?v=1676941880"},
  {"name":"Honey Butter Diced Chicken with Rosemary Carrots, Potatoes & Roasted Green Beans","websiteUrl":"https://factor-us-development.myshopify.com/products/honey-butter-diced-chicken-with-rosemary-carrots-potatoes-roasted-green-beans","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_HoneyButterDicedChicken_2022_Plated_WhiteLabel.jpg?v=1676941541"},
  {"name":"Fusilli & Ground Pork Tomato Ragu with Roasted Green Beans","websiteUrl":"https://factor-us-development.myshopify.com/products/fusilli-ground-pork-tomato-ragu-with-roasted-green-beans","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/OptimizedWLFusilli_GroundPorkTomatoRagu.jpg?v=1676941445"},
  {"name":"Potato Leek Mash & Grilled Chicken with Roasted Corn & Zucchini Saute","websiteUrl":"https://factor-us-development.myshopify.com/products/potato-leek-mash-grilled-chicken-with-roasted-corn-zucchini-saute","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLPotatoLeekMash_GrilledChicken.jpg?v=1676941338"},
  {"name":"Fiery Beef & Black Bean Chili with Cilantro Sweet Potatoes & Corn Salsa","websiteUrl":"https://factor-us-development.myshopify.com/products/fiery-beef-black-bean-chili-with-cilantro-sweet-potatoes-corn-salsa","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLFieryBeef_BlackBeanChili.jpg?v=1676941239"},
  {"name":"Sweet Corn-Jalapeño Polenta & Chicken with Creamy Corn Grits & Roasted Peppers","websiteUrl":"https://factor-us-development.myshopify.com/products/sweet-corn-jalapeno-polenta-chicken-with-creamy-corn-grits-roasted-peppers","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/OptimizedWLSweetCorn-JalapenoPolenta_Chicken.jpg?v=1676941132"},
  {"name":"Creamy Poblano Chicken with Poblano Zoodles, Queso Verde & Ranchero Beans","websiteUrl":"https://factor-us-development.myshopify.com/products/creamy-poblano-chicken-with-poblano-zoodles-queso-verde-ranchero-beans","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLCreamyPoblanoChicken2.jpg?v=1676941019"},
  {"name":"Four-Cheese Cabbage & Shredded Chicken with Tomato-Garlic Cauliflower","websiteUrl":"https://factor-us-development.myshopify.com/products/four-cheese-cabbage-shredded-chicken-with-tomato-garlic-cauliflower","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_Four-CheeseCabbage_ShreddedChicken_2022_Plated_WhiteLabel.jpg?v=1676940690"},
  {"name":"Patty Melt & Caraway Onions with Cauliflower Mash & Cabbage Spinach Medley","websiteUrl":"https://factor-us-development.myshopify.com/products/patty-melt-caraway-onions-with-cauliflower-mash-cabbage-spinach-medley","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_PattyMelt_2022_Plated_WhiteLabel.jpg?v=1676940601"},
  {"name":"Chipotle-Rubbed Pork Chop with Roasted Cabbage & Red Bell Pepper Fondue","websiteUrl":"https://factor-us-development.myshopify.com/products/chipotle-rubbed-pork-chop-with-roasted-cabbage-red-bell-pepper-fondue","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_ChipotleRubbedPorkChop_2022_Plated_WhiteLabel.jpg?v=1676940467"},
  {"name":"Creamy Tomato Pork Tenderloin with Wilted Spinach, Broccoli & Mushrooms","websiteUrl":"https://factor-us-development.myshopify.com/products/creamy-tomato-pork-tenderloin-with-wilted-spinach-broccoli-mushrooms","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_CreamyTomatoPorkTenderloin.jpg?v=1676940350"},
  {"name":"Parmesan-Crusted Chicken with Creamy Pesto Spinach, Roasted Green Beans & Grape Tomatoes","websiteUrl":"https://factor-us-development.myshopify.com/products/parmesan-crusted-chicken-with-creamy-pesto-spinach-roasted-green-beans-grape-tomatoes","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLParmesan-CrustedChicken.jpg?v=1676940224"},
  {"name":"Ground Beef & Thyme Cottage Pie with Parmesan-Buttered Zucchini","websiteUrl":"https://factor-us-development.myshopify.com/products/ground-beef-thyme-cottage-pie-with-parmesan-buttered-zucchini","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLGroundBeef_ThymeCottagePie.jpg?v=1676939128"},
  {"name":"Chile Roasted Chicken with Red Pepper Cream, Purple Cabbage & Zucchini","websiteUrl":"https://factor-us-development.myshopify.com/products/chile-roasted-chicken-with-red-pepper-cream-purple-cabbage-zucchini","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLChileRoastedChicken.jpg?v=1676939004"},
  {"name":"Mujadara (Lentils & Rice) with Tahini Roasted Carrots & Spicy Cilantro Schug","websiteUrl":"https://factor-us-development.myshopify.com/products/f00412c-mujadara-lentils-rice-with-tahini-roasted-carrots-spicy-cilantro-schug","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_MujadaraLentilsAndRice_2022_Plated_WhiteLabel.jpg?v=1676937669"},
  {"name":"Spicy Sweet Potatoes & Peanut Sauce with Coconut Rice & Miso-Roasted Green Beans","websiteUrl":"https://factor-us-development.myshopify.com/products/spicy-sweet-potatoes-peanut-sauce-with-coconut-rice-miso-roasted-green-beans","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLSpicySweetPotatoes_PeanutSauce.jpg?v=1676937309"},
  {"name":"Cacio e Pepe with Broccoli & Cauliflower","websiteUrl":"https://factor-us-development.myshopify.com/products/cacio-e-pepe-with-broccoli-cauliflower","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLCacioePepePasta.jpg?v=1676936958"},
  {"name":"Garlic Herb Salmon with Celery Root Mash, Cauliflower & Tomatoes","websiteUrl":"https://factor-us-development.myshopify.com/products/garlic-herb-salmon-with-celery-root-mash-cauliflower-tomatoes","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLGarlicHerbSalmon.jpg?v=1676935963"},
  {"name":"Fire-Roasted Red Pepper Chicken with Tomato Cauliflower & Balsamic Green Beans","websiteUrl":"https://factor-us-development.myshopify.com/products/fire-roasted-red-pepper-chicken-with-tomato-cauliflower-balsamic-green-beans","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_FireRoastedRedPepperChicken_2022_Plated_WhiteLabel.jpg?v=1676935799"},
  {"name":"Artichoke & Parmesan Pork Chop with Herb Roasted Carrots & Potatoes","websiteUrl":"https://factor-us-development.myshopify.com/products/artichoke-parmesan-pork-chop-with-herb-roasted-carrots-potatoes","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_ArtichokeAndParmesanPorkChop_2022_Plated_WhiteLabel.jpg?v=1676935694"},
  {"name":"Chorizo Tostada Bake with Cilantro Lime Rice & Scallion Sour Cream","websiteUrl":"https://factor-us-development.myshopify.com/products/chorizo-tostada-bake-with-cilantro-lime-rice-scallion-sour-cream","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLChorizoTostadaBake.jpg?v=1676935535"},
  {"name":"Butternut Squash & Sage Chicken Macaroni with Garlic Green Beans & Apple Cranberry Crumble","websiteUrl":"https://factor-us-development.myshopify.com/products/butternut-squash-sage-chicken-macaroni-with-garlic-green-beans-apple-cranberry-crumble","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLButternutSquash_SageChickenMacaronijpeg.jpg?v=1676935395"},
  {"name":"Chicken Alfredo Pasta with Red Lentil Fusilli & Roasted Broccoli","websiteUrl":"https://factor-us-development.myshopify.com/products/chicken-alfredo-pasta-with-red-lentil-fusilli-roasted-broccoli","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLChickenAlfredoPasta.jpg?v=1676934772"},
  {"name":"Sweet Mustard Glazed Chicken with Browned Butter Mashed Potatoes & Leek Cream Green Beans","websiteUrl":"https://factor-us-development.myshopify.com/products/sweet-mustard-glazed-chicken-with-browned-butter-mashed-potatoes-leek-cream-green-beans","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_SweetMustardGlazedChicken_2022_Plated_WhiteLabel.jpg?v=1676934596"},
  {"name":"Cranberry BBQ Chicken with Brown Butter Sweet Potato Mash & Garlic Green Beans","websiteUrl":"https://factor-us-development.myshopify.com/products/cranberry-bbq-chicken-with-brown-butter-sweet-potato-mash-garlic-green-beans","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLCranberryBbqChicken.jpg?v=1676934445"},
  {"name":"Ground Pork & Cheddar Chili Mac with Broccoli & Garlic-Chive Corn","websiteUrl":"https://factor-us-development.myshopify.com/products/ground-pork-cheddar-chili-mac-with-broccoli-garlic-chive-corn","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_GroundPork_CheddarChiliMac_2022_Plated_WhiteLabel.jpg?v=1676934307"},
  {"name":"Creamed Corn Chicken with Roasted White Cheddar Potatoes","websiteUrl":"https://factor-us-development.myshopify.com/products/creamed-corn-chicken-with-roasted-white-cheddar-potatoes","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLCreamedCornChicken_2021_Plated_WhiteLabel.jpg?v=1676934151"},
  {"name":"Chive & Garlic Chicken with Creamy Cheddar Mash, Green Beans & Mushrooms","websiteUrl":"https://factor-us-development.myshopify.com/products/chive-garlic-chicken-with-creamy-cheddar-mash-green-beans-mushrooms","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLChive_GarlicChicken.jpg?v=1676933505"},
  {"name":"Louisiana Shrimp with Smoked Gouda Cauliflower Grits & Chicken Andouille Tomato Gravy","websiteUrl":"https://factor-us-development.myshopify.com/products/louisiana-shrimp-with-smoked-gouda-cauliflower-grits-chicken-andouille-tomato-gravy","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_LouisianaShrimp_2022_Plated_WhiteLabel.jpg?v=1676933062"},
  {"name":"Broccoli Cheddar Ground Beef with Chili Garlic Zucchini & Red Bell Peppers","websiteUrl":"https://factor-us-development.myshopify.com/products/broccoli-cheddar-ground-beef-with-chili-garlic-zucchini-red-bell-peppers","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_BroccoliCheddarGroundBeef_2022_Plated_WhiteLabel.jpg?v=1676879559"},
  {"name":"Roasted Tomato & Chile Ground Beef with Creamy Herb Green Beans","websiteUrl":"https://factor-us-development.myshopify.com/products/roasted-tomato-chile-ground-beef","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_SpicyCalabrianGroundBeef_2021_Plated.jpg?v=1676879088"},
  {"name":"Chipotle Queso Chicken with Mexican Cauliflower Rice & Roasted Zucchini","websiteUrl":"https://factor-us-development.myshopify.com/products/chipotle-queso-chicken-with-mexican-cauliflower-rice-roasted-zucchini","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLChipotleQuesoChicken.jpg?v=1676878952"},
  {"name":"Sun-Dried Tomato Chicken with Zucchini Noodles","websiteUrl":"https://factor-us-development.myshopify.com/products/sun-dried-tomato-chicken","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/OptimizedWLSunDriedTomatoChicken.jpg?v=1676878788"},
  {"name":"Jalapeño Popper Burger with Cauliflower Popper Rice & Roasted Zucchini","websiteUrl":"https://factor-us-development.myshopify.com/products/jalapeno-popper-burger","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_JalapenoPopperBurger_2022_Plated_WhiteLabel.jpg?v=1676878660"},
  {"name":"Cheesy Bacon Ranch Shredded Chicken with Portobellos & Garlic Broccoli","websiteUrl":"https://factor-us-development.myshopify.com/products/cheesy-bacon-ranch-shredded-chicken","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLCheesyBaconRanchShreddedChicken.jpg?v=1676878328"},
  {"name":"Creamy Parmesan Chicken with Broccoli & Tomatoes","websiteUrl":"https://factor-us-development.myshopify.com/products/creamy-parmesan-chicken-with-broccoli-tomatoes","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLCreamyParmesanChicken_2022_Plated_WhiteLabel.jpg?v=1676878214"},
  {"name":"Chickpea Curry with Forbidden Rice Blend & Ginger Green Beans","websiteUrl":"https://factor-us-development.myshopify.com/products/chickpea-curry","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/ChickpeaCurry_2022_Plated.jpg?v=1676877384"},
  {"name":"Coconut Lime Curried Tofu with Lentil Rice, Spicy Sweet Potatoes & Broccoli","websiteUrl":"https://factor-us-development.myshopify.com/products/coconut-lime-curried-tofu","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_CoconutLimeCurriedTofu_2022_Plated_WhiteLabel.jpg?v=1676959154"},
  {"name":"Caramelized Onion & Goat Cheese Risotto with Roasted Carrots","websiteUrl":"https://factor-us-development.myshopify.com/products/caramelized-onion-goat-cheese-risotto","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLCaramlizedOnion_GoatCheeseRisotto.jpg?v=1676937200"},
  {"name":"Sun-Dried Tomato & Spinach Fusilli with Italian Herb-Roasted Zucchini","websiteUrl":"https://factor-us-development.myshopify.com/products/sun-dried-tomato-spinach-fusilli","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLSun-DriedTomato_SpinachFusilli.jpg?v=1676959033"},
  {"name":"Cavatappi & Shrimp Scampi with Steamed Broccoli","websiteUrl":"https://factor-us-development.myshopify.com/products/cavatappi-shrimp-scampi","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_CavatappiAndShrimpScampi_2022_Plated_WhiteLabel.jpg?v=1676958958"},
  {"name":"Garlic Mushroom Cream Shredded Beef with Roasted Potatoes, Garlic Green Beans & Pearl Onions","websiteUrl":"https://factor-us-development.myshopify.com/products/garlic-mushroom-cream-shredded-beef","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_GarlicMushroomCreamShreddedBeef_2022_Plated_WhiteLabel.jpg?v=1676958865"},
  {"name":"Shredded Buffalo Chicken with Ranch Mashed Potatoes, Cauliflower, Carrots & Celery","websiteUrl":"https://factor-us-development.myshopify.com/products/shredded-buffalo-chicken","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_ShreddedBuffaloChicken_2022_Plated_WhiteLabel.jpg?v=1676958759"},
  {"name":"Italian Sausage & Sweet Peperonata with Roasted Garlic & Herb Potatoes","websiteUrl":"https://factor-us-development.myshopify.com/products/italian-sausage-sweet-peperonata","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_ItalianSausageAndSweetPeperonata_2022_Plated_WhiteLabel.jpg?v=1676958663"},
  {"name":"Shredded Chicken Parmesan Fusilli with Garlic Broccoli","websiteUrl":"https://factor-us-development.myshopify.com/products/shredded-chicken-parmesan-fusilli","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLShreddedChickenParmesanFusilli.jpg?v=1676957697"},
  {"name":"Chicken Fajita Bowl with Stewed Black Beans & Chipotle Crema","websiteUrl":"https://factor-us-development.myshopify.com/products/chicken-fajita-bowl","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLChickenFajitaBowl.jpg?v=1676957383"},
  {"name":"Rosemary Pepper Pork Chop with Red Pepper Cauliflower Mash, Haricots Verts & Mushroom Cream","websiteUrl":"https://factor-us-development.myshopify.com/products/rosemary-pepper-pork-chop","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_RosemaryPepperPorkChop_2023_Plated_WhiteLabel.jpg?v=1676957282"},
  {"name":"Chicken & Mushroom Marsala with Garlic Mashed Cauliflower & Haricots Verts","websiteUrl":"https://factor-us-development.myshopify.com/products/chicken-mushroom-marsala","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLChicken_MushroomMarsala.jpg?v=1676957156"},
  {"name":"Homestyle Ground Beef & Chive Potato Mash with Broccoli & Carrot Coins","websiteUrl":"https://factor-us-development.myshopify.com/products/homestyle-ground-beef-chive-potato-mash","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLHomestyleGroundBeef_ChivePotatoMash.jpg?v=1676933960"},
  {"name":"Roasted Garlic Chicken with Sour Cream & Onion Mashed Potatoes","websiteUrl":"https://factor-us-development.myshopify.com/products/roasted-garlic-chicken-1","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLRoastedGarlicChicken_d859f3fd-4533-401d-817b-1f7498386205.jpg?v=1676954337"},
  {"name":"Carolina Mustard BBQ Ground Pork with Pimento Cauliflower “Grits”","websiteUrl":"https://factor-us-development.myshopify.com/products/carolina-mustard-bbq-ground-pork","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_CarolinaMustardBBQGroundPork_2022_Plated_WhiteLabel.jpg?v=1676954233"},
  {"name":"Pork Tenderloin & Cheesy Cabbage with Garlic Butter Green Beans","websiteUrl":"https://factor-us-development.myshopify.com/products/pork-tenderloin-cheesy-cabbage","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/OptimizedWLPorkTenderloin_CabbageCasserole.jpg?v=1676954138"},
  {"name":"Beef, Peppers & Creamy Broccoli Rice Bowl with Parmesan Herb Zucchini & Yellow Squash","websiteUrl":"https://factor-us-development.myshopify.com/products/beef-peppers-creamy-broccoli-rice-bowl","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_Beef_Peppers_CreamyBroccoliRiceBowl_2022_Plated_WhiteLabel.jpg?v=1676953960"},
  {"name":"Char-Grilled Burger & Mushroom Cream Sauce with Steamed Spinach, Tomatoes & Parmesan Cauliflower Mash","websiteUrl":"https://factor-us-development.myshopify.com/products/char-grilled-burger-mushroom-cream-sauce","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLChar-GrilledBurger_MushroomCreamSauce.jpg?v=1676953802"},
  {"name":"Chipotle-Spiced Potato & Pepper Bowl with Ranchero Beans, Crema & Crushed Tostadas","websiteUrl":"https://factor-us-development.myshopify.com/products/chipotle-spiced-potato-pepper-bowl","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_Chipotle-SpicedPotato_PepperBowl_2022_Plated_WhiteLabel.jpg?v=1677023214"},
  {"name":"Grilled Chicken & Poblano-Cauli Mash with Zucchini-Pepper Medley","websiteUrl":"https://factor-us-development.myshopify.com/products/grilled-chicken-poblano-cauli-mash","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_GrilledChicken_Poblano-CauliMash_2022_Plated_WhiteLabel.jpg?v=1676953547"},
  {"name":"Italian Ground Beef & Marinara Bowl with Ricotta & Pesto Zucchini","websiteUrl":"https://factor-us-development.myshopify.com/products/italian-ground-beef-marinara-bowl","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLItalianGroundBeef_MarinaraBowl.jpg?v=1676953280"},
  {"name":"Spinach & Mushroom Chicken Thighs with Creamy Parmesan & White Wine Sauce","websiteUrl":"https://factor-us-development.myshopify.com/products/spinach-mushroom-chicken-thighs","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/Spinach_MushroomChickenThighs_2022_Plated_WhiteLabel.jpg?v=1676953100"},
  {"name":"Indian Butter Chicken with Cilantro Lime Cauliflower Rice","websiteUrl":"https://factor-us-development.myshopify.com/products/indian-butter-chicken","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLIndianButterChicken_2022_Plated.jpg?v=1676944009"},
  {"name":"Herb-Crusted Chicken with Mashed Cauliflower & Toasted Almond Green Beans","websiteUrl":"https://factor-us-development.myshopify.com/products/herb-crusted-chicken","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/OptimizedWLHerb-CrustedChicken.jpg?v=1676877944"},
  {"name":"Turkey Chili & Zucchini with Ancho Lime Crema","websiteUrl":"https://factor-us-development.myshopify.com/products/turkey-chili-zucchini","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_TurkeyChiliAndZucchini_2022_Plated_WhiteLabel.jpg?v=1676878051"},
  {"name":"Spicy Poblano Beef Bowl with Roasted Broccoli Rice & Scallion Sour Cream","websiteUrl":"https://factor-us-development.myshopify.com/products/spicy-poblano-beef-bowl","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLSpicyPoblanoBeefBowl.jpg?v=1676943546"},
  {"name":"Garlic-Mushroom Chicken Thighs with Creamy Cauliflower Rice & Garlic Green Beans","websiteUrl":"https://factor-us-development.myshopify.com/products/garlic-mushroom-chicken-thighs","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_Garlic-MushroomChickenThighs_2022_Plated_WhiteLabel.jpg?v=1676939261"},
  {"name":"Cheesy Chicken & Peppers with Garlic Butter Zucchini","websiteUrl":"https://factor-us-development.myshopify.com/products/cheesy-chicken-peppers","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLCheesyChicken_Peppers.jpg?v=1676939352"},
  {"name":"White Cheddar Chicken with Broccoli-Parmesan Grits, Roasted Green Beans & Sliced Almonds","websiteUrl":"https://factor-us-development.myshopify.com/products/white-cheddar-chicken","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_WhiteCheddarChicken_2022_Plate_WhiteLabel.jpg?v=1676943861"},
  {"name":"Black Pepper & Sage Pork Chop with Smoked Cheddar Brussels Sprouts & Creamy Broccoli","websiteUrl":"https://factor-us-development.myshopify.com/products/black-pepper-sage-pork-chop","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_BlackPepperAndSagePorkChop_2022_Plated_V2_WhiteLable.jpg?v=1676943634"},
  {"name":"Cheeseburger & Bacon-Tomato Chutney with Garlic Broccoli & Parmesan Herb Butter","websiteUrl":"https://factor-us-development.myshopify.com/products/cheeseburger-bacon-tomato-chutney","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_Cheeseburger_Bacon-TomatoChutney_2022_Plated_WhiteLabel.jpg?v=1677043102"},
  {"name":"Garlic Pork Tenderloin with Asiago Cauliflower Mash & Pesto Green Beans","websiteUrl":"https://factor-us-development.myshopify.com/products/garlic-pork-tenderloin","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLGarlicPorkTenderloin.jpg?v=1676879443"},
  {"name":"Tomato & Romano Chicken with Roasted Zucchini & Parmesan Herb Butter","websiteUrl":"https://factor-us-development.myshopify.com/products/tomato-romano-chicken","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLTomato_RomanoChicken.jpg?v=1677044184"},
  {"name":"Sliced Sausage & Creamy Mustard Cabbage with Chili Garlic Green Beans","websiteUrl":"https://factor-us-development.myshopify.com/products/sliced-sausage-creamy-mustard-cabbage","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_SlicedSausage_CreamyMustardCabbage_2022_Plated_WhiteLabel.jpg?v=1677044123"},
  {"name":"Pesto Salmon with Creamed Spinach & Tomato Butter Haricots Verts","websiteUrl":"https://factor-us-development.myshopify.com/products/pesto-salmon","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/OptimizedWLPestoSalmon.jpg?v=1676940800"},
  {"name":"Roasted Garlic Chicken with Green Beans & Sour Cream & Onion Mashed Potatoes","websiteUrl":"https://factor-us-development.myshopify.com/products/roasted-garlic-chicken","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLRoastedGarlicChicken.jpg?v=1676940916"},
  {"name":"Chorizo Chili Mac with Cauliflower & Poblano Peppers","websiteUrl":"https://factor-us-development.myshopify.com/products/chorizo-chili-mac","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLChorizoChiliMac.jpg?v=1677044065"},
  {"name":"Sour Cream & Chive Chicken with Yukon Mash & Garlic Broccoli","websiteUrl":"https://factor-us-development.myshopify.com/products/sour-cream-chive-chicken","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLSourCream_ChiveChicken.jpg?v=1676945381"},
  {"name":"Tomato Basil Chicken Risotto with Parmesan Broccoli","websiteUrl":"https://factor-us-development.myshopify.com/products/tomato-basil-chicken-risotto","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/TomatoBasilChickenRisotto_2022_Plated_WhiteLabel.jpg?v=1677044016"},
  {"name":"Fiery Beef & Black Bean Chili with Cilantro Sweet Potatoes & Corn Salsa","websiteUrl":"https://factor-us-development.myshopify.com/products/fiery-beef-black-bean-chili","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLFieryBeef_BlackBeanChili_c2e3a9a5-4fb4-45fa-857f-91c938758396.jpg?v=1677043964"},
  {"name":"Italian Herb Chicken with Vegetable Risotto & Roasted Green Beans","websiteUrl":"https://factor-us-development.myshopify.com/products/italian-herb-chicken","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLItalianHerbChicken.jpg?v=1677043918"},
  {"name":"Fusilli & Ground Pork Tomato Ragu with Roasted Green Beans","websiteUrl":"https://factor-us-development.myshopify.com/products/fusilli-ground-pork-tomato-ragu","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/OptimizedWLFusilli_GroundPorkTomatoRagu_a12e8b4c-6867-40f2-9f80-24a94a810132.jpg?v=1677043831"},
  {"name":"Shredded Chicken Taco Bowl with Roasted Corn Salsa & Cilantro Lime Sour Cream","websiteUrl":"https://factor-us-development.myshopify.com/products/shredded-chicken-taco-bowl","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_ShreddedChickenTacoBowl_2021_Plated_WhiteLabel.jpg?v=1676933192"},
  {"name":"Stuffed Pepper Casserole with Roasted Green Beans","websiteUrl":"https://factor-us-development.myshopify.com/products/stuffed-pepper-casserole","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLStuffedPepperCasserole.jpg?v=1676933314"},
  {"name":"Creamy Lemon Pepper Chicken with Carrot-Pea Rice Pilaf, Roasted Broccoli & Carrot Coins","websiteUrl":"https://factor-us-development.myshopify.com/products/creamy-lemon-pepper-chicken-1","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_CreamyLemonPepperChicken_2022_Plated_WhiteLabel.jpg?v=1677042987"},
  {"name":"Nonna's Sunday Beef Bolognese with Lasagnette & Garlicky Zucchini","websiteUrl":"https://factor-us-development.myshopify.com/products/nonnas-sunday-beef-bolognese","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_Nonna_sSundayBeefBolognese_2022_Plated_1200_WhiteLabel.jpg?v=1677042820"},
  {"name":"Cajun Pork Chop with Carrot Hash, Bean-Corn Salad & Honey Aioli","websiteUrl":"https://factor-us-development.myshopify.com/products/cajun-pork-chop","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_CajunPorkChop_2022_Plated_WhiteLabel.jpg?v=1677042593"},
  {"name":"Horseradish Shredded Beef with Smashed Potatoes & Roasted Brussels Sprouts","websiteUrl":"https://factor-us-development.myshopify.com/products/horseradish-shredded-beef","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLHorseradishShreddedBeef.jpg?v=1676934843"},
  {"name":"Herb Cream Cheese Salmon with Red Pepper Cauliflower Grits & Broccoli","websiteUrl":"https://factor-us-development.myshopify.com/products/herb-cream-cheese-salmon","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/OptimizedWLHerbCreamCheeseSalmon.jpg?v=1676951911"},
  {"name":"Romano & Black Pepper Shrimp Pasta with Broccoli & Cauliflower","websiteUrl":"https://factor-us-development.myshopify.com/products/romano-black-pepper-shrimp-pasta","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_RomanoAndBlackPepperShrimpPasta_2022_Plated_WhiteLabel.jpg?v=1677040989"},
  {"name":"Roasted Vegetable Fusilli with Tomato Cauliflower","websiteUrl":"https://factor-us-development.myshopify.com/products/roasted-vegetable-fusilli","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLRoastedVegetableFusilli.jpg?v=1677040696"},
  {"name":"Vegan Mushroom Marsala with Onion Risotto & Roasted Garlic Green Beans","websiteUrl":"https://factor-us-development.myshopify.com/products/vegan-mushroom-marsala","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/OptimizedWLVeganMushroomMarsala.jpg?v=1677042452"},
  {"name":"Peanut Buddha Bowl with Cilantro Quinoa, Gochugaru-Spiced Peanuts & Sesame Broccoli","websiteUrl":"https://factor-us-development.myshopify.com/products/peanut-buddha-bowl","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLPeanutBuddahBowl.jpg?v=1676951701"},
  {"name":"Roasted Five Vegetable Enchilada Bowl with Mexican-Style Cilantro Rice","websiteUrl":"https://factor-us-development.myshopify.com/products/roasted-five-vegetable-enchilada-bowl","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_RoastedFiveVegetableEnchiladaBowl_2022_Plated_WhiteLabel.jpg?v=1677041423"},
  {"name":"Three Bean Vegan Chili with Cornbread Casserole & Tofu-Based Crema","websiteUrl":"https://factor-us-development.myshopify.com/products/three-bean-vegan-chili","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLThreeBeanVeganChili.jpg?v=1676877195"},
  {"name":"Peruvian Chicken with Red Pepper Cauliflower Grits & Broccoli","websiteUrl":"https://factor-us-development.myshopify.com/products/peruvian-chicken","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/OptimizedWLPeruvianGrilledChicken.jpg?v=1677043729"},
  {"name":"Yia Yia's Greek Beef Bowl with Garlic Zucchini & Spiced Sour Cream","websiteUrl":"https://factor-us-development.myshopify.com/products/yia-yias-greek-beef-bowl","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WLYiaYiasGreekBeefBowl.jpg?v=1677044312"},
  {"name":"Chorizo Chili with Shredded Cheese & Scallion Sour Cream","websiteUrl":"https://factor-us-development.myshopify.com/products/chorizo-chili","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_ChorizoChili_2023_Plated_WhiteLabel.jpg?v=1676938825"},
  {"name":"Jalapeño-Lime-Cheddar Chicken with Spicy Cilantro Cauliflower Rice","websiteUrl":"https://factor-us-development.myshopify.com/products/jalapeno-lime-cheddar-chicken","image":"https://cdn.shopify.com/s/files/1/0704/0080/3133/products/WL_JalapenoLimeCheddarChicken_2022_Plated_WhiteLabel.jpg?v=1676879232"}
  ]

class Test extends Module {
  /**
   * ## constructor
   *
   * sets the initial "global" variables and configuration
   *
   * @param {Object} _bot instance of _Val with a core attached
   * @param {Object} _modules config and instance of all modules
   * @param {Object} userConfig available options
   * @param {Object} commandModule instance of the applied core
   *
   * @return {Void} void
   */
  constructor(_bot, _modules, userConfig, commandModule) {
    super(_bot, _modules, userConfig, commandModule);

    const configuration = new Configuration({
      apiKey: "<api key>"
    });

    this.openai = new OpenAIApi(configuration);
    this.mailchimp = mailchimp("<api key>");
  }

  buildHumanRequest(answers) {
    const {
      "What is your age?": age,
      "What is your Gender?": gender,
      "Do you have any of the following health conditions?": heathIssue,
      "What is your height in centimeter?": height,
      "What is your weight in kilograms?": weight,
      "How would you describe your activity level?": lifestyle,
      "How many meals per week would you like to plan with Factor?": mealCount
    } = answers;

    return `
      Imagine a person that ${lifestyle !== "Other" ? `has a ${lifestyle} lifestyle, `: ""}is ${gender}, ${age} years old, ${weight} kilos, and is ${height} centimeters tall. ${heathIssue !== "None of the Above" ? `They have ${heathIssue}.` : ""} The following array is a list of meals available to them.

      ${JSON.stringify(EXAMPLE_MEALS.map(a => a.name))}

      Considering the above information about this person, generate json containing the following:
      + daily suggested calories
      + daily suggested carbohydrates
      + daily suggested protein
      + daily suggested fat
      + daily suggested fiber
      + daily suggested vitamins and minerals
      + daily recommend activity
      + a ${mealCount} day dinner plan based on your nutritional recommendations compared to the nutritional content of the meals. please include reasons why you picked each meal

      In the following format:

      interface response {
        age: number;
        gender: string;
        weight: number;
        height: number;
        activity_level: string;
        calories: {
          minimum: number;
          maximum: number;
        },
        carbohydrates: {
          percentage: {
            minimum: number;
            maximum: number;
          }
        },
        protein: {
          percentage: {
            minimum: number;
            maximum: number;
          }
        },
        fat: {
          percentage: {
            minimum: number;
            maximum: number;
          }
        },
        fiber: {
          grams: number;
        },
        vitamins: string;
        minerals: string;
        activity_recommendation: string;
        meal_plan: {
          Day_1: {
            meal: string;
            reasoning: string;
          },
          Day_2: {
            meal: string;
            reasoning: string;
          },
          Day_3: {
            meal: string;
            reasoning: string;
          },
          Day_4: {
            meal: string;
            reasoning: string;
          },
          Day_5: {
            meal: string;
            reasoning: string;
          }
        }
      }
    `;
  }


  /**
   * ## test
   *
   * this function is run with the test command. it exists purely for feature
   * testing. sometimes it does nothing
   *
   * @param {String} from originating channel
   * @param {String} to originating user
   * @param {String} text full message text
   *
   * @return {Boolean}  false
   */
  test(from, to, text) {
    if (!text) {
      return null;
    }

    let formResponse;

    try {
      formResponse = JSON.parse(text);
    } catch {
      return "Sorry, for now your question must be JSON";
    }

    const fields = {};
    formResponse?.definition?.fields?.forEach(field => fields[field.id] = field);

    const answers = {};
    formResponse?.answers?.forEach(obj => {
      const fieldData = fields[obj.field.id] || {};

      switch (obj.type) {
        case "text":
          answers[fieldData.title] = obj.text;
          break;
        case "choice":
          answers[fieldData.title] = obj.choice.label;
          break;
        case "email":
          answers[fieldData.title] = obj.email;
          break;
      }
    });

    return Promise.resolve(this.openai.createChatCompletion({
      model: "gpt-3.5-turbo-16k",
      messages: [
        {role: "system", content: "You are a helpful assistant that provides general activity and nutrional information"},
        {role: "user", content: this.buildHumanRequest(answers)}
      ],
  })).then(res => {
    const text = res.data.choices[0].message.content;
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}") + 1;

    const json = text.slice(jsonStart, jsonEnd);

    return Promise.all([this.mailchimp.templates.render({
      template_name: "factor-fit-email-template",
      template_content: [],
    }), JSON.parse(json)]);
  }).then(([template, json]) => {
    const { age, height, weight, activity_recommendation, activity_level, meal_plan } = json;
    const { Day_1, Day_2, Day_3, Day_4, Day_5 } = meal_plan;

    const day1Meal = EXAMPLE_MEALS.filter(m => m.name === Day_1.meal)[0];
    const day2Meal = EXAMPLE_MEALS.filter(m => m.name === Day_2.meal)[0];
    const day3Meal = EXAMPLE_MEALS.filter(m => m.name === Day_3.meal)[0];
    const day4Meal = EXAMPLE_MEALS.filter(m => m.name === Day_4.meal)[0];
    const day5Meal = EXAMPLE_MEALS.filter(m => m.name === Day_5.meal)[0];

    const updatedTemplate = template.html
      .replace("{{age}}", age)
      .replace("{{height}}", height)
      .replace("{{weight}}", weight)
      .replace("{{activity_level}}", activity_level)
      .replace("{{activity_recommendation}}", activity_recommendation)
      .replace("{{day1Name}}", day1Meal.name)
      .replace("{{day1Image}}", day1Meal.image)
      .replace("{{day1Url}}", day1Meal.websiteUrl)
      .replace("{{day2Name}}", day2Meal.name)
      .replace("{{day2Image}}", day2Meal.image)
      .replace("{{day2Url}}", day2Meal.websiteUrl)
      .replace("{{day3Name}}", day3Meal.name)
      .replace("{{day3Image}}", day3Meal.image)
      .replace("{{day3Url}}", day3Meal.websiteUrl)
      .replace("{{day4Name}}", day4Meal.name)
      .replace("{{day4Image}}", day4Meal.image)
      .replace("{{day4Url}}", day4Meal.websiteUrl)
      .replace("{{day5Name}}", day5Meal.name)
      .replace("{{day5Image}}", day5Meal.image)
      .replace("{{day5Url}}", day5Meal.websiteUrl);

    return this.mailchimp.messages.send({
      message: {
        from_email: "health@factor75.knoblau.ch",
        subject: "Factor_Fit - Your personal nutritionist, coach, and friend",
        html: updatedTemplate,
        to: [{ email: "customer@factor75.knoblau.ch", type: "to" }]
      }
    });
  }).then(res => {
    if (res[0].status === "sent") {
      return "message sent";
    } else {
      throw new Error("Message not sent");
    }
  })

    // console.log(
    //   'this is all disabled for now.  go here => http://compromise.cool/'
    // );
  }

  /**
   * ## responses
   *
   * @return {Object} responses
   */
  responses() {
    const { trigger } = this.userConfig;

    return {
      commands: {
        test: {
          f: this.test,
          desc: "never really know what you'll find here...",
          syntax: [`${trigger}test <things maybe?>`],
        },
      },
    };
  }
}

module.exports = Test;
