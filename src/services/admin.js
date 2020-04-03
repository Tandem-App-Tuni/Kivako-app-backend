/********
 * user.js file (services/users)
 ********/
const express = require('express');
const User = require('../models/user');
const Match = require('../models/match');
var passwordHash = require('password-hash');


const getLanguageStatitics = async (req, res, next) => 
{
    try 
    {
        let languageStatitics = []

        // Check in each learn language the possible matchs, and save this users in a list
        for (i = 0; i < languages.length; i++) {
            let languagesToTeach = await User.countDocuments({
                "languagesToTeach.language": languages[i]
            }, );
            let languagesToLearn = await User.countDocuments({
                "languagesToLearn.language": languages[i]
            }, );
            let matchesInLanguage = await Match.countDocuments({
                "matchLanguage": languages[i],
                "status": 2
            }, );

            //console.log(languages[i] + " / Learn: " + languagesToTeach + " / Teach: " + languagesToLearn + " / Matches: " + matchesInLanguage)

            let format = {
                language: languages[i],
                numberWantToLearn: languagesToLearn,
                numberWantToTeach: languagesToTeach,
                activeMatches: matchesInLanguage
            }

            languageStatitics.push(format);
        }

        return res.status(200).json({
            // Create data section with language as key value of the users
            'data': languageStatitics
        });

    } catch (error) 
    {
        console.log(error);

        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

const getStudentUsers = async (req, res, next) => 
{
    try {

        let users = await User.find({
            "isAdmin": false
        }, {
            languagesToTeach: 0,
            languagesToLearn: 0,
            __v: 0,
            matches: 0
        });

        if (users.length > 0) return res.status(200).json({data: users});
        return res.status(404).json({data:[]});
    } 
    catch (error) 
    {
        return res.status(500).json({data:[]});
    }
}

const getMatches = async (req, res, next) => 
{
    try
    {
        let matches = await Match.find({}, {_id:0, requesterUser: 1, recipientUser: 1, status:1})
                                 .populate('requesterUser', {_id:0, firstName:1, lastName:1, languagesToTeach:1, languagesToLearn:1, email:1})
                                 .populate('recipientUser', {_id:0, firstName:1, lastName:1, languagesToTeach:1, languagesToLearn:1, email:1});

        matches = matches.filter(e => (e.requesterUser !== null) && (e.recipientUser !== null) && (e.status === 2));

        return res.status(200).json({data: matches});
    }
    catch(error)
    {
        console.log('[ADMIN] Error in getMatches', error);
    }
}

const getAdminUsers = async (req, res, next) => {
    try {

        let users = await User.find({
            "isAdmin": true
        }, {
            languagesToTeach: 0,
            languagesToLearn: 0,
            __v: 0,
            matches: 0
        });

        if (users.length > 0) {
            return res.status(200).json({
                'data': users
            });
        }

        return res.status(404).json({
            'code': 'BAD_REQUEST_ERROR',
            'description': 'No users found in the system'
        });
    } catch (error) {
        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

const createAdminUser = async (req, res, next) => {
    try {

        const {
            firstName,
            lastName,
            email,
            cities,
            descriptionText,
            languagesToTeach,
            languagesToLearn,
            userIsActivie,
            password
        } = req.body;

        if (email === undefined || email === '') {
            return res.status(422).json({
                'code': 'REQUIRED_FIELD_MISSING',
                'description': 'email is required',
                'field': 'email'
            });
        }
        
        let isEmailExists = await User.findOne({
            "email": email
        });

        if (isEmailExists) {
            return res.status(409).json({
                'code': 'ENTITY_ALREAY_EXISTS',
                'description': 'email already exists',
                'field': 'email'
            });
        }

        let hashedPassword = passwordHash.generate(password);

        const temp = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            cities: cities,
            descriptionText: descriptionText,
            languagesToTeach: languagesToTeach,
            languagesToLearn: languagesToLearn,
            userIsActivie: userIsActivie,
            isAdmin: true,
            password:hashedPassword
        };

        let newUser = await User.create(temp);

        if (newUser) {
            return res.status(201).json({
                'userAdded': true
            });
        } else {
            throw new Error('something went worng');
        }
    } catch (error) {
        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

module.exports = {
    getLanguageStatitics: getLanguageStatitics,
    getStudentUsers: getStudentUsers,
    getAdminUsers: getAdminUsers,
    createAdminUser: createAdminUser,
    getMatches:getMatches
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