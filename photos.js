'use strict';
// Photographs from Wikimedia Commons: [title, author, licence, source page]
const PHOTO_META = {
 "dawn": [
  "A Misty Dawn, Dandenong Ranges",
  "Uzman Naleer",
  "CC BY-SA 4.0",
  "https://commons.wikimedia.org/wiki/File:A_Misty_Dawn,_Dandenong_Ranges.jpg"
 ],
 "day": [
  "Caribbean Sea - Long Exposure",
  "Martin Falbisoner",
  "CC BY-SA 4.0",
  "https://commons.wikimedia.org/wiki/File:Caribbean_Sea_-_Long_Exposure.jpg"
 ],
 "dusk": [
  "Chimney Rock Trail Point Reyes December 2016 panorama 2",
  "King of Hearts",
  "CC BY-SA 4.0",
  "https://commons.wikimedia.org/wiki/File:Chimney_Rock_Trail_Point_Reyes_December_2016_panorama_2.jpg"
 ],
 "night": [
  "Linnutee - Milky Way (9) copy",
  "Kristian Pikner",
  "CC BY-SA 4.0",
  "https://commons.wikimedia.org/wiki/File:Linnutee_-_Milky_Way_(9)_copy.jpg"
 ],
 "journal": [
  "Hommikune udu Kakerdaja rabas",
  "Abrget47j",
  "CC BY-SA 3.0",
  "https://commons.wikimedia.org/wiki/File:Hommikune_udu_Kakerdaja_rabas.jpg"
 ],
 "calm": [
  "Lake Seliger. Ostashkov. View of Voroniy Island",
  "Александр Байдуков",
  "CC BY-SA 4.0",
  "https://commons.wikimedia.org/wiki/File:Lake_Seliger._Ostashkov._View_of_Voroniy_Island.jpg"
 ],
 "plan": [
  "The Pinnacle, Grampians National Park Sunrise",
  "Joshua Tagicakibau",
  "CC BY-SA 4.0",
  "https://commons.wikimedia.org/wiki/File:The_Pinnacle,_Grampians_National_Park_Sunrise.jpg"
 ],
 "more": [
  "Dülmen, Kirchspiel, Börnste, Feld -- 2017 -- 3171",
  "Dietmar Rabich",
  "CC BY-SA 4.0",
  "https://commons.wikimedia.org/wiki/File:D%C3%BClmen,_Kirchspiel,_B%C3%B6rnste,_Feld_--_2017_--_3171.jpg"
 ],
 "wave": [
  "Santorin (GR), Exomytis, Vlychada Beach -- 2017 -- 2999 (bw)",
  "Dietmar Rabich",
  "CC BY-SA 4.0",
  "https://commons.wikimedia.org/wiki/File:Santorin_(GR),_Exomytis,_Vlychada_Beach_--_2017_--_2999_(bw).jpg"
 ],
 "jasmund": [
  "2019 - Nationalpark Jasmund - 01",
  "Moahim",
  "CC BY-SA 4.0",
  "https://commons.wikimedia.org/wiki/File:2019_-_Nationalpark_Jasmund_-_01.jpg"
 ],
 "aurora": [
  "Aurora Australis Over the Tasman Sea from SouthWest National Park",
  "Jamen Percy",
  "CC BY-SA 4.0",
  "https://commons.wikimedia.org/wiki/File:Aurora_Australis_Over_the_Tasman_Sea_from_SouthWest_National_Park.jpg"
 ],
 "bieszczady": [
  "Bieszczady - sunrise from Chatka Puchatka (2)",
  "Pudelek",
  "CC BY-SA 4.0",
  "https://commons.wikimedia.org/wiki/File:Bieszczady_-_sunrise_from_Chatka_Puchatka_(2).jpg"
 ],
 "bontecou": [
  "Bontecou Lake Milky Way panorama",
  "Juliancolton",
  "CC BY-SA 4.0",
  "https://commons.wikimedia.org/wiki/File:Bontecou_Lake_Milky_Way_panorama.jpg"
 ],
 "puerto": [
  "Dawn in Puerto Encantado",
  "Paolo Costa Baldi",
  "CC BY-SA 3.0",
  "https://commons.wikimedia.org/wiki/File:Dawn_in_Puerto_Encantado.jpg"
 ],
 "desna": [
  "Desna river Vinn meadow 2019 G01",
  "George Chernilevsky",
  "Public domain",
  "https://commons.wikimedia.org/wiki/File:Desna_river_Vinn_meadow_2019_G01.jpg"
 ],
 "trees": [
  "Dülmen, Kirchspiel, Börnste, Felder und Bäume -- 2017 -- 3160-6",
  "Dietmar Rabich",
  "CC BY-SA 4.0",
  "https://commons.wikimedia.org/wiki/File:D%C3%BClmen,_Kirchspiel,_B%C3%B6rnste,_Felder_und_B%C3%A4ume_--_2017_--_3160-6.jpg"
 ],
 "gurudongmar": [
  "Gurudongmar Lake Sikkim, India (edit)",
  "Original: Yoghya Derivative work: UnpetitproleX",
  "CC BY-SA 4.0",
  "https://commons.wikimedia.org/wiki/File:Gurudongmar_Lake_Sikkim,_India_(edit).jpg"
 ],
 "jokulsarlon": [
  "Jokulsarlon lake, Iceland",
  "Kenny Muir",
  "CC BY 2.0",
  "https://commons.wikimedia.org/wiki/File:Jokulsarlon_lake,_Iceland.jpg"
 ],
 "karst": [
  "Karst peaks with sea of clouds at sunrise, South view from the top of Mount Nam Xay, Vang Vieng, Laos",
  "Basile Morin",
  "CC BY-SA 4.0",
  "https://commons.wikimedia.org/wiki/File:Karst_peaks_with_sea_of_clouds_at_sunrise,_South_view_from_the_top_of_Mount_Nam_Xay,_Vang_Vieng,_Laos.jpg"
 ],
 "bondhus": [
  "Lake Bondhus Norway 2862",
  "Alchemist-hp (talk) (www.pse-mendelejew.de)",
  "FAL",
  "https://commons.wikimedia.org/wiki/File:Lake_Bondhus_Norway_2862.jpg"
 ],
 "clearwater": [
  "Lake Clearwater, Canterbury, New Zealand 02",
  "Michal Klajban",
  "CC BY-SA 4.0",
  "https://commons.wikimedia.org/wiki/File:Lake_Clearwater,_Canterbury,_New_Zealand_02.jpg"
 ],
 "kinney": [
  "Lake Kinney mit Mount Whitehorn",
  "Florian Fuchs",
  "CC BY 3.0",
  "https://commons.wikimedia.org/wiki/File:Lake_Kinney_mit_Mount_Whitehorn.jpg"
 ],
 "field": [
  "Morning mist lifting from plowed field 3",
  "W.carter",
  "CC0",
  "https://commons.wikimedia.org/wiki/File:Morning_mist_lifting_from_plowed_field_3.jpg"
 ],
 "olkhon": [
  "Olkhon Island, Capes, cliffs at sunset, Lake Baikal, Russia",
  "Vyacheslav Argenberg",
  "CC BY 4.0",
  "https://commons.wikimedia.org/wiki/File:Olkhon_Island,_Capes,_cliffs_at_sunset,_Lake_Baikal,_Russia.jpg"
 ],
 "paddy": [
  "Square plot of a green paddy field and water reflection of mountains with mist and blue sky, Vang Vieng, Laos",
  "Basile Morin",
  "CC BY-SA 4.0",
  "https://commons.wikimedia.org/wiki/File:Square_plot_of_a_green_paddy_field_and_water_reflection_of_mountains_with_mist_and_blue_sky,_Vang_Vieng,_Laos.jpg"
 ],
 "namxay": [
  "Sunny mist in the mountains at golden hour, South-West view from Mount Nam Xay, Vang Vieng, Laos",
  "Basile Morin",
  "CC BY-SA 4.0",
  "https://commons.wikimedia.org/wiki/File:Sunny_mist_in_the_mountains_at_golden_hour,_South-West_view_from_Mount_Nam_Xay,_Vang_Vieng,_Laos.jpg"
 ],
 "everest": [
  "Sunset view of Everest",
  "Nir B. Gurung",
  "CC BY-SA 4.0",
  "https://commons.wikimedia.org/wiki/File:Sunset_view_of_Everest.jpg"
 ],
 "corniche": [
  "Waves at La Corniche",
  "Christian Ferrer",
  "CC BY 4.0",
  "https://commons.wikimedia.org/wiki/File:Waves_at_La_Corniche.jpg"
 ],
 "zagedan": [
  "Zagedan Lakes, Mountain cirque, Caucasus Mountains",
  "Vyacheslav Argenberg",
  "CC BY 4.0",
  "https://commons.wikimedia.org/wiki/File:Zagedan_Lakes,_Mountain_cirque,_Caucasus_Mountains.jpg"
 ]
};
// Each slot rotates through its list, one photo per day.
const PHOTOS = {"dawn": ["dawn", "puerto", "desna", "clearwater", "bieszczady"], "day": ["day", "kinney", "zagedan", "gurudongmar", "paddy", "bondhus"], "dusk": ["dusk", "jokulsarlon", "olkhon", "corniche", "namxay", "everest"], "night": ["night", "bontecou", "aurora"], "journal": ["journal", "trees", "field", "desna"], "calm": ["calm", "clearwater", "wave", "bondhus", "day"], "plan": ["plan", "karst", "jasmund", "kinney"], "progress": ["bieszczady", "everest", "karst", "zagedan", "plan"], "more": ["more", "trees", "puerto"], "wave": ["wave", "day", "calm"]};
