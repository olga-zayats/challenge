import { LightningElement, api, track, wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import { getObjectInfo, getPicklistValues } from "lightning/uiObjectInfoApi";
import missionMessageChannel from '@salesforce/messageChannel/missionMessageChannel__c';
import getMissionById from '@salesforce/apex/SuperheroMissionController.getMissionById';
import getCurrentUserHero from '@salesforce/apex/SuperheroMissionController.getCurrentUserHero';
import createMissionAssignments from '@salesforce/apex/MissionAssignmentController.createMissionAssignments';
import HERO_OBJECT from "@salesforce/schema/Hero__c";
import RANK_FIELD from "@salesforce/schema/Hero__c.Rank__c";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

const MISSION_DETAIL_FIELDS = [
    {name: 'Subject__c'},
    {name: 'Details__c'},
    {name: 'Complexity_Rank__c', label: 'Rank'},
    {name: 'Reward__c'},
    {name: 'Deadline__c'}
];

export default class MissionDetails extends LightningElement {
    subscription = null;
    recordId;
    record;
    hero;
    error;
    heroRecordTypeId;
    ranks;

    @api emptyDetailText;
    @track missionData;

    @wire(MessageContext)
    messageContext;

    @wire(getMissionById, {
        recordId: '$recordId'
    }) wiredMission({ error, data }) {
        if (data) {
            this.record = data;
            console.log(this.record);
            this.missionData = MISSION_DETAIL_FIELDS.map(field => { return {...field,
                value : this.record[field.name],
                label : field.label || field.name.replace('__c', '').replace('_', ' ')
            }});
            this.error = undefined;
        } else if (error) {
          this.error = error;
          this.record = undefined;
        }
    };

    @wire(getCurrentUserHero, {})
    wiredHero({ error, data }) {
        if (data) {
            this.hero = data;
        } else if (error) {
            this.error = error;
            this.hero = undefined;
          }
    }

    @wire(getObjectInfo, { objectApiName: HERO_OBJECT })
    wiredHeroObjectInfo({ error, data }) {
        if (data) {
            this.heroRecordTypeId = data.defaultRecordTypeId;
            this.error = undefined;
        } else if (error) {
            // todo error handling to function
            this.error = error;
            this.heroRecordTypeId = undefined;
        }
    }

    @wire(getPicklistValues, { recordTypeId: "$heroRecordTypeId", fieldApiName: RANK_FIELD })
    picklistResults({ error, data }) {
        if (data) {
            this.ranks = data.values.map(field => field.value);
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.ranks = undefined;
        }
    }

    get showAcceptButton() {
        return !this.record?.Mission_Assignments__r?.length;
    }

    get showCompleteButton() {
        return this.record?.Mission_Assignments__r?.length && this.record?.Mission_Assignments__r[0].Status__c === 'In Progress';
    }

    subscribeToMessageChannel() {
        this.subscription = subscribe(
            this.messageContext,
            missionMessageChannel,
            (message) => this.handleMessage(message)
        );
    }

    handleMessage(message) {
        this.recordId = message.recordId;
    }

    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    handleAcceptClick() {
        if (!this.checkIfHeroRankIsSuitable()) return;

        let heroAndMissionIds = {};
        heroAndMissionIds[this.hero.Id] = [this.record.Id];

        console.log(JSON.stringify(heroAndMissionIds));

        // todo accept mission
        createMissionAssignments({heroAndMissionIds: heroAndMissionIds}).then(() => {
            this.showToast('SUCCESS', 'New mission assignment created!', 'success');
            this.error = undefined;
        }).catch((error) => {
            this.error = error;
            this.showToast('ERROR', error.body.message, 'error');
        });
    }

    handleCompleteClick() {

    }

    checkIfHeroRankIsSuitable() {
        let heroRankIndex = this.ranks.indexOf(this.hero?.Rank__c);
        let missionRankIndex = this.ranks.indexOf(this.record?.Complexity_Rank__c);

        if (heroRankIndex - 1 > missionRankIndex) {
            let neededRank = this.ranks[missionRankIndex + 1] || this.ranks[missionRankIndex];
            this.showToast('WARNING', `К сожалению, вы слишком слабый на данный момент, чтобы взяться за эту работку! Возвращайтесь, ` +
                `когда достигнете ранга ${neededRank}.`, 'warning');
            return false;
        }

        if (heroRankIndex <= missionRankIndex - 2) {
            this.showToast('WARNING', 'К сожалению, эта работка для вас слишком проста!', 'warning');
            return false;
        }
            
        return true;
    }

    showToast(title, message, variant) {
          this.dispatchEvent(new ShowToastEvent({
            title: title || '',
            message: message || '',
            variant: variant,
          }));
    }
}