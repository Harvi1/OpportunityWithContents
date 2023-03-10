import { LightningElement, api, track, wire } from 'lwc';
import { subscribe, onError } from 'lightning/empApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getcontactdata from '@salesforce/apex/OpportunityWithContents.getcontentdata';
import updatecontentData from '@salesforce/apex/OpportunityWithContents.updatecontentData';
import retrieveContent from '@salesforce/apex/ShowbasedonsearchContentStageName.retrieveContent';

export default class ContentsRecordsLwcClone extends LightningElement {
    @api recordId;
    @track oppstage;
    @track message;
    @track IsLoading = false;
    @track records;
    @track currentName;
    @track search;
    @track searchStageName;
    @track dataNotFound;
    
    subscription = {};
    @api channelName = '/event/Content_Event__e';
    @track Contentdata = [];
    @track updatedcontentdata = [];
    @track setContentdata = [];
    @track opportunity = [];
    error;
    
    @track serachkey = '';
    connectedCallback() {
        console.log('recordId-->' + this.recordId);
        this.registerErrorListener();
        this.handleSubscribe();
    }
    
    @wire(getcontactdata, { recordId: '$recordId' })
    wiredContentData({ error, data }) {
        console.log('wire method called!!');
        if (data) {
            console.log('wire method called!!');
            this.Contentdata = data;
            this.IsLoading = false;
            this.visibility = true;
            this.isvisible = false;
            console.log('this.Contentdata-->>' + JSON.stringify(this.Contentdata));
            //this.serachkey = '';
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.Contentdata = undefined;
        }
    }
    @wire(updatecontentData, { oppStage: '$oppstage' })
    updatedwiredContentData({ error, data }) {
        this.IsLoading = true;
        console.log('this.IsLoading-->>' + this.IsLoading);
        if (data) {
            console.log('wire method called!!');
            this.Contentdata = data;
            this.IsLoading = false;
            console.log('this.updatedcontentdata-->>' + JSON.stringify(this.Contentdata));
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.Contentdata = undefined;
        }
    }
    
    // @wire(retrieveContent, { keySearch: '$searchStageName' })
    // wireRecord({ data, error }) {
    //     if (data) {
    //         this.records = data;
    //         this.isvisible = true;
    //         this.visibility = false;
    //         console.log('Check Data Here......' + this.records);
    //         this.error = undefined;
    //         this.dataNotFound = '';
    //         if (this.records == '') {
    //             this.dataNotFound = 'There is no Content found';
    //         }
    //     } else {
    //         this.error = error;
    //         this.data = undefined;
    //     }
    // }
    //this.recorddata = this.records;
    handleSearchchange(event) {
        this.searchStageName = event.target.value;
    }
    handleSearchclick() {
        retrieveContent({ keySearch: this.searchStageName })
            .then(result => { 
                this.records = result;
            }).catch(error => {
                console.error(error);
            })
    }
    handleSubscribe() {
        console.log('handleSubscribe method called');
        const self = this;
        const messageCallback = function (response) {
            console.log('New message received 1: ', JSON.stringify(response));
            console.log('New message received 2: ', response);
            var obj = response;
            console.log(obj.data.payload);
            console.log(obj.data.payload.Message__c);
            console.log(self.channelName);
            let objData = obj.data.payload;
            self.message = objData.Message__c;
            self.oppstage = objData.Status__c;
            self.recordId = objData.RecordId__c;
            //self.ShowToast('Techdicer Plaform Event', self.message, 'success', 'dismissable');
        };

        // Invoke subscribe method of empApi. Pass reference to messageCallback
        subscribe(this.channelName, -1, messageCallback).then(response => {
            // Response contains the subscription information on subscribe call
            console.log('Subscription request sent to: ', JSON.stringify(response.channel));
            this.subscription = response;
        });
    }
    //handle Error
    registerErrorListener() {
        onError(error => {
            console.log('Received error from server: ', JSON.stringify(error));
        });
    }
    ShowToast(title, message, variant, mode) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: mode
        });
        this.dispatchEvent(evt);
    }
}