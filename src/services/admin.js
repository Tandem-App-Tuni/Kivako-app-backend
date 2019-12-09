
/********
* user.js file (services/users)
********/
const express = require('express');
const User = require('../models/user');
const Match = require('../models/match');


const getLanguageStatitics = async (req, res, next) => {
    try {
        let languageStatitics = []
        
        // Check in each learn language the possible matchs, and save this users in a list
        for (i = 0; i < languages.length; i++) {
            let languagesToTeach = await User.countDocuments({"languagesToTeach.language":languages[i]},);
            let languagesToLearn = await User.countDocuments({"languagesToLearn.language":languages[i]},);
            let matchesInLanguage = await Match.countDocuments({"matchLanguage":languages[i], "status":2},);

            //console.log(languages[i] + " / Learn: " + languagesToTeach + " / Teach: " + languagesToLearn + " / Matches: " + matchesInLanguage)

            let format = {language: languages[i], 
                            numberWantToLearn: languagesToLearn, 
                            numberWantToTeach:languagesToTeach, 
                            activeMatches: matchesInLanguage }
            
            languageStatitics.push(format);
           /* 
            languagesList.push(userLearnLanguages[i].language);
            // Get all users that match, but not the user that made the request and users that user have a match already
            // $ne -> mongodb query that mean Not Equals.
           ult
        
            if(users == []){
                // Nothing to do
                usersList.push([]);
                //console.log("No potential match users in this language");
            }else{
                // Add possible match users to list
                usersList.push(users);
            }
            users = null;
            */
        }

        return res.status(200).json({
            // Create data section with language as key value of the users
            'data': languageStatitics
        });
        
    } catch (error) {
        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

module.exports =
{
    getLanguageStatitics:getLanguageStatitics
};

const languages = [
    //"Abkhaz",
    //"Adyghe",
    //"Akan",
   "Albanian",
    //"Amharic",
   "Arabic",
    //"Aragonese",
   "Arbëresh",
   "Aromanian",
   "Assamese",
   "Asturian (Astur-Leonese)",
   "Austro-Bavarian (Bavarian)",
   "Avar",
   "Awadhi",
   "Azerbaijani",
   "Balochi",
   "Bashkir",
   "Basque",
   "Belarusian",
   "Bengali (Bangla)",
   "Bhojpuri",
   "Bosnian",
   "Breton",
   "Bulgarian",
   "Burmese",
   "Catalan",
   "Cebuano (Visayan)",
   "Chechen",
   "Chewa",
   "Chhattisgarhi",
   "Chinese, Mandarin",
   "Chinese, Wu (inc. Shanghainese)",
   "Chinese, Yue (inc. Cantonese)",
   "Chittagonian",
   "Chuvash",
   "Corsican",
   "Crimean Tatar",
   "Croatian",
   "Czech",
   "Danish",
   "Deccan",
   "Dhundhari",
   "Dutch",
   "Eastern Min (inc. Fuzhou dialect)",
   "English",
   "Erzya",
   "Estonian",
   "Extremaduran",
   "Faroese",
   "Finnish",
    //"Franco-Provençal",
   "French",
   "Frisian",
   "Fula",
   "Gagauz",
   "Galician",
   "Gan",
   "German",
   "Greek",
   "Gujarati",
   "Haitian Creole",
   "Hakka",
   "Haryanvi",
   "Hausa",
   "Hebrew",
   "Hiligaynon Ilonggo (Visayan)",
   "Hungarian",
   "Hindi[a]",
   "Hmong",
   "Hungarian",
   "Icelandic",
   "Igbo",
   "Ingush",
   "Ilocano",
   "Italian",
   "Irish",
   "Japanese",
   "Javanese",
   "Jin",
   "Judaeo-Spanish (Ladino)",
   "Kabardian",
   "Kalmyk",
   "Kannada",
   "Karachay-Balkar",
   "Karelian",
   "Kashubian",
   "Kazakh",
   "Khmer",
   "Kinyarwanda",
   "Kirundi",
   "Komi",
   "Konkani",
   "Korean",
   "Kurdish",
   "Latin",
   "Latvian",
   "Ligurian",
   "Lithuanian",
   "Lombard",
   "Low German (Low Saxon)",
   "Luxembourgish",
   "Macedonian",
   "Madurese",
   "Magahi",
   "Mainfränkisch",
   "Maithili",
   "Malagasy",
   "Malay (inc. Indonesian and Malaysian)",
   "Malayalam",
   "Maltese",
   "Marathi",
   "Mari",
   "Marwari",
   "Montenegrin",
   "Mossi",
   "Neapolitan",
   "Nepali",
   "Norman",
   "Northern Min",
   "Norwegian",
   "Occitan",
   "Odia (Oriya)",
   "Oromo",
   "Ossetian",
   "Palatinate German",
   "Pashto",
   "Persian",
   "Picard",
   "Piedmontese",
   "Polish",
   "Portuguese",
   "Punjabi",
   "Quechua",
   "Rhaeto-Romance",
   "Ripuarian (Platt)",
   "Romani",
   "Romanian",
   "Russian",
   "Sami (the Finnish variants)",
   "Saraiki",
   "Sardinian",
   "Scots",
   "Scottish Gaelic",
   "Serbian",
   "Shona",
   "Sicilian",
   "Silesian",
   "Sindhi",
   "Sinhalese",
   "Slovak",
   "Slovene",
   "Somali",
   "Southern Min (inc. Hokkien and Teochew)",
   "Spanish (Castillian)",
   "Sundanese",
   "Swabian German",
   "Swahili",
   "Swedish",
   "Swiss German",
   "Sylheti",
   "Tabasaran",
   "Tagalog (Filipino)",
   "Tamil",
   "Tat",
   "Tatar",
   "Telugu",
   "Thai",
   "Turkish",
   "Turkmen",
   "Udmurt",
   "Ukrainian",
   "Upper Saxon",
   "Urdu",
   "Uyghur",
   "Uzbek",
   "Venetian",
   "Vietnamese",
   "Võro",
   "Walloon",
   "Welsh",
   "Xhosa",
   "Xiang",
   "Yiddish",
   "Yoruba",
   "Zhuang",
   "Zulu"
 ];