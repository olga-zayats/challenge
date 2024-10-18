import { LightningElement, api, track, wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import missionMessageChannel from '@salesforce/messageChannel/missionMessageChannel__c';
import getMissionById from '@salesforce/apex/SuperheroMissionController.getMissionById';

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
    error;
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
          console.log('errrr');
          console.log(error.body?.message);

          this.error = error;
          this.record = undefined;
        }
    };

    subscribeToMessageChannel() {
        this.subscription = subscribe(
            this.messageContext,
            missionMessageChannel,
            (message) => this.handleMessage(message)
        );
    }

    handleMessage(message) {
        console.log('got record id!!!!', message.recordId);
        this.recordId = message.recordId;
    }

    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    handleButtonClick(event) {
        
    }
}