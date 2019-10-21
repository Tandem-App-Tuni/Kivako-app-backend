
import React, {Component} from 'react'
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import PreferenceItem from '../../components/PreferenceItem';
import ResponsiveDrawer from '../MenuDrawer';
//import TandemLanguages from '../../../models/TandemLanguages';

import toastr from 'toastr';


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Material UI
//import StudyLanguagesInput from './TandemStudyLanguagesInput';
//import TeachLanguagesInput from './TandemTeachLanguagesInput';

import InfoIcon from '@material-ui/icons/Info';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import {strings} from '../../components/constant/localization'
import {Colors, preferenceConfig} from '../../components/constant/index'
export const preferenceStepType = {"general": 1, "teach": 2, "study": 3, "generalPreferences": 4, "avatar": 5};


const styles = {
    infoButtonContainer: {
        height: '50px'
    },
    infoButton: {
        position: 'absolute',
        right: '16px'
    },
    title: {
        textAlign: 'center',
        padding: 15,
    },
    note: {
        textAlign: 'center',
        color: Colors.mainColor,
        'font-size': '14px'
    },
    scroll: {
        overflow: 'auto',
        whiteSpace: 'nowrap',
        margin: 8,
        height: 320
    },
    submit: {
        width: 100,
        float: 'right',
        margin: 16,

    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////    Class

class TandemPreferences extends React.Component {
    state = {
        step: preferenceStepType.general,
        teachLanguages: [], //credits, langId, levelId, motivation, userId, _id
        studyLanguages: [], //credits, langId, levelId, motivation, userId, _id

        pickedLanguages: [], //credits, langId, levelId, motivation, userId, _id
    
    };

    componentWillReceiveProps(nextProps) {
        const teachLanguages = nextProps.teachingLangs;
        const studyLanguages = nextProps.learningLangs;

        let step = preferenceStepType.general;

        let pickedLanguages = this.state.pickedLanguages;
       
        this.setState(
            {
                teachLanguages: teachLanguages,
                studyLanguages: studyLanguages,
                step: step,
                pickedLanguages: pickedLanguages
            }
        );
    }

    backHandler = () => {
        
            switch (this.state.step) {
                case preferenceStepType.general: {
                    //this.props.history.goBack();
                    break;
                }
                case preferenceStepType.teach: {
                    this.setState({
                        step: preferenceStepType.general
                    });
                    break;
                }
                case preferenceStepType.study: {
                    this.setState({
                        step: preferenceStepType.general
                    });
                    break;
                }
                case preferenceStepType.generalPreferences: {
                    this.setState({
                        step: preferenceStepType.general
                    });
                    break;
                }
            }
        
    }

    editTeachLanguageHandler = () => {
        const pickedLanguages = [...this.state.teachLanguages];
        this.setState({
            step: preferenceStepType.teach,
            pickedLanguages: pickedLanguages
        });
    }

    editStudyLanguageHandler = () => {
        const pickedLanguages = [...this.state.studyLanguages];
        this.setState({
            step: preferenceStepType.study,
            pickedLanguages: pickedLanguages
        });
    }

    editGeneralHandler = () => {
        this.setState({
            step: preferenceStepType.generalPreferences,
        });
    }

    editAccountHandler = () => {
        
    }

    //handle when select value from drop down box
    changeTeachLanguageHandler = (language, level, index) => {
        // var pickedLanguages = [...this.state.pickedLanguages];
        // if (index === pickedLanguages.length) {
        //     if (language != noLanguage && level != noLevel) {
        //         pickedLanguages.push({language: language, level: level});
        //         this.setState({
        //             pickedLanguages: pickedLanguages
        //         });
        //     }
        // }
        // if (index < pickedLanguages.length) {
        //     if (language != noLanguage && level != noLevel) {
        //         pickedLanguages[index] = {langId: language._id, levelId: level._id};
        //         this.setState({
        //             pickedLanguages: pickedLanguages
        //         });
        //     }
        //     else {
        //         pickedLanguages.splice(index, 1);
        //         this.setState({
        //             pickedLanguages: pickedLanguages
        //         });
        //     }
        // }
    }

    changeStudyLanguageHandler = (language, level, credit, index) => {
        // var pickedLanguages = [...this.state.pickedLanguages];
        // if (index === pickedLanguages.length) {
        //     if (language != noLanguage && level != noLevel && credit != 0) {
        //         pickedLanguages.push({language: language, level: level, credit: credit});
        //         this.setState({
        //             pickedLanguages: pickedLanguages
        //         });
        //     }
        // }
        // if (index < pickedLanguages.length) {
        //     if (language != noLanguage && level != noLevel && credit > 0) {
        //         pickedLanguages[index] = {langId: language._id, levelId: level._id, credits: credit};
        //         this.setState({
        //             pickedLanguages: pickedLanguages
        //         });
        //     }
        //     else {
        //         pickedLanguages.splice(index, 1);
        //         this.setState({
        //             pickedLanguages: pickedLanguages
        //         });
        //     }
        // }
    }

    handleSaveLanguages = () => {
        // if (this.state.step === preferenceStepType.teach) {
        //     $('#tandemLoading').fadeIn();
        //     Meteor.call('tandemUserLanguages/setPreferences',
        //         this.state.pickedLanguages,
        //         TeachingMotivationEnum.WTTEACH,
        //         success(() => {
        //             toastr.success(t("Message_Saving_Preference"), t("Title_Saving_Preference"));
        //         }));
        // }
        // else if (this.state.step === preferenceStepType.study) {
        //     $('#tandemLoading').fadeIn();
        //     Meteor.call('tandemUserLanguages/setPreferences',
        //         this.state.pickedLanguages,
        //         TeachingMotivationEnum.WTLEARN,
        //         success(() => {
        //             toastr.success(t("Message_Saving_Preference"), t("Title_Saving_Preference"));
        //         }));
        // }
    }

    render() {
        const {classes} = this.props;
        let page = null;


        switch (this.state.step) {
            case preferenceStepType.general: {
                let teachLanguagesString = 'English'//this.state.teachLanguages.map(
                    //(languageData) => TandemLanguages.findById(languageData.langId).name).join(", ");
                let studyLanguagesString = 'Finish, Swedish'//this.state.studyLanguages.map(
                    //(languageData) => TandemLanguages.findById(languageData.langId).name).join(", ");

                page = (
                    <ResponsiveDrawer title="Preferences">
                    <div>

                        <PreferenceItem title={"I can teach"}
                                        content={teachLanguagesString}
                                        action={this.editTeachLanguageHandler}/>
                        <PreferenceItem title={"I want to learn"}
                                        content={studyLanguagesString}
                                        action={this.editStudyLanguageHandler}/>
                        
                    </div>
                    </ResponsiveDrawer>
                );
                break;
            }

            // case preferenceStepType.teach: {
            //     const teachInputList = this.state.pickedLanguages.map((language) =>
            //         <TeachLanguagesInput
            //             key={this.state.pickedLanguages.indexOf(language)}
            //             index={this.state.pickedLanguages.indexOf(language)}
            //             changeTeachLanguageValue={this.changeTeachLanguageHandler}
            //             languageId={language.langId}
            //             levelId={language.levelId}
            //             pickedLanguages={this.state.pickedLanguages}
            //             unavailableLanguages={this.state.studyLanguages}

            //         />
            //     );

            //     let header = (<TandemHeader title={t("Preferences_T")}
            //                                 displayArrow={true} backAction={this.backHandler}/>);

            //     if (this.state.type === preferenceScreenType.firstTime) {
            //         header = null;
            //     }
            //     page = (
            //         <div>
            //             {header}
            //             <div className={classes.infoButtonContainer}>
            //                 <Tooltip title={t("info_about_language_levels")}
            //                          aria-label={t("info_about_language_levels")}>
            //                     <IconButton className={classes.infoButton} size="big"
            //                                 href="https://en.wikipedia.org/wiki/Common_European_Framework_of_Reference_for_Languages#Common_reference_levels"
            //                                 target="_blank">
            //                         <InfoIcon fontSize="large" color="secondary"/>
            //                     </IconButton>
            //                 </Tooltip>
            //             </div>
            //             <div>
            //                 <h3 className={classes.title}>{t("preference_item_input_header_T")}</h3>
            //                 <p className={classes.note}>{t("language_max_study_T")}</p>
            //             </div>
            //             <div className={classes.scroll}>
            //                 {teachInputList}
            //                 {
            //                     this.state.pickedLanguages.length < preferenceConfig.maxTeachLanguage &&
            //                     <TeachLanguagesInput index={this.state.pickedLanguages.length}
            //                                          changeTeachLanguageValue={this.changeTeachLanguageHandler}
            //                                          languageId={0}
            //                                          levelId={0}
            //                                          pickedLanguages={this.state.pickedLanguages}
            //                                          unavailableLanguages={this.state.studyLanguages}
            //                     />
            //                 }

            //             </div>
            //             <div>
            //                 <Typography variant="h6">
            //                     <Button className={"tandem-more-languages-button"} variant="contained">
            //                         {t("preference_missing_language")}
            //                     </Button>
            //                 </Typography>
            //             </div>
            //             <PreferenceActionButtons
            //                 type={this.state.type}
            //                 step={this.state.step}
            //                 handleSave={this.handleSaveLanguages}
            //                 handleNext={this.handleSaveLanguages}
            //                 handleBack={this.backHandler}
            //             />
            //         </div>
            //     );
            //     break;
            // }
            // case preferenceStepType.study: {
            //     const studyInputList = this.state.pickedLanguages.map((language) =>
            //         <StudyLanguagesInput
            //             key={this.state.pickedLanguages.indexOf(language)}
            //             index={this.state.pickedLanguages.indexOf(language)}
            //             changeStudyLanguageValue={this.changeStudyLanguageHandler}
            //             languageId={language.langId}
            //             levelId={language.levelId}
            //             credit={language.credits}
            //             pickedLanguages={this.state.pickedLanguages}
            //             unavailableLanguages={this.state.teachLanguages}
            //         />
            //     );

            //     page = (
            //         <div>
            //             <TandemHeader title={t("Preferences_L")} displayArrow={true} backAction={this.backHandler}/>
            //             <div className={classes.infoButtonContainer}>
            //                 <Tooltip title={t("info_about_language_levels")}
            //                          aria-label={t("info_about_language_levels")}>
            //                     <IconButton className={classes.infoButton} size="big"
            //                                 href="https://en.wikipedia.org/wiki/Common_European_Framework_of_Reference_for_Languages#Common_reference_levels"
            //                                 target="_blank">
            //                         <InfoIcon fontSize="large" color="secondary"/>
            //                     </IconButton>
            //                 </Tooltip>
            //             </div>
            //             <div>
            //                 <h3 className={classes.title}>{t("preference_item_input_header_L")}</h3>
            //                 <p className={classes.note}>{t("language_max_study_L")}</p>
            //             </div>
            //             <div className={classes.scroll}>
            //                 {studyInputList}
            //                 {
            //                     this.state.pickedLanguages.length < preferenceConfig.maxStudyLanguage &&
            //                     <
            //                         StudyLanguagesInput index={this.state.pickedLanguages.length}
            //                                             changeStudyLanguageValue={this.changeStudyLanguageHandler}
            //                                             languageId={0}
            //                                             levelId={0}
            //                                             credit={0}
            //                                             pickedLanguages={this.state.pickedLanguages}
            //                                             unavailableLanguages={this.state.teachLanguages}

            //                     />
            //                 }
            //             </div>
            //             <div>
            //                 <Typography variant="h6">
            //                     <Button className={"tandem-more-languages-button"} variant="contained">
            //                         {t("preference_missing_language")}
            //                     </Button>
            //                 </Typography>
            //             </div>
            //             <PreferenceActionButtons
            //                 type={this.state.type}
            //                 step={this.state.step}
            //                 handleSave={this.handleSaveLanguages}
            //                 handleNext={this.handleSaveLanguages}
            //                 handleBack={this.backHandler}
            //             />
            //         </div>
            //     );
            //     break;
            // }
            // case preferenceStepType.generalPreferences: {
            //     page = (
            //         <div>
            //             <TandemHeader title={t("Preferences_M")} displayArrow={true} backAction={this.backHandler}/>
            //             <TandemGeneralPreferencesInput/>
            //         </div>
            //     );
            //     break;
            // }
            // case preferenceStepType.avatar: {
            //     page = (
            //         <div>
            //             <AvatarInput onChange={this.avatarPicked}/>
            //             <PreferenceActionButtons
            //                 type={this.state.type}
            //                 step={this.state.step}
            //                 handleSave={this.handleSaveAvatar}
            //                 handleNext={this.handleSaveAvatar}
            //                 handleBack={this.backHandler}
            //             />
            //         </div>
            //     );
            //     break;
            // }
        }
        return page;
    }
}

export default withStyles(styles)(TandemPreferences);


