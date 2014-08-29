/**
 * Created by tailor on 8/28/2014.
 */
'use strict';

angular.module('hdxadmin.filters', [])
    .filter('setSize',[function()
    {
        return function(bytes) {

            // var sizes = ['Bytes', 'KB', 'MB', 'GB'];
            var sizes = [getLocaleString('_Bytes_'),getLocaleString('_KB_'),getLocaleString('_MB_'),getLocaleString('_GB_')];
            if (bytes == 0) return '0 Bytes';
            var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
            var newSize= (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
            if(SAW.session.locale=="de-de" || SAW.session.locale=="fr-fr"){
                newSize= newSize.replace('.',',');
            }
            return newSize;
        };
    }])
    .filter('setStatus',['$filter',function($filter)
    {
        return function(statusText) {
            if(statusText!='undefined'){
                var newStatus="";
                if(statusText=="Closed First Contact" || statusText=="Withdrawn" || statusText=="Closed" || statusText=="Auto Closed"){
                    newStatus="_Closed_";
                }
                else if(statusText=="Pending Customer Action" || statusText=="Pending Customer Response"){
                    newStatus="_PendingCustomerResponse_";
                }
                else{
                    newStatus="_InProcessAgent_";
                }
                var statusAsLang=$filter('i18n')(newStatus);
                return statusAsLang;
            }

        };
    }])
    .filter('decodeString',[function(){

        return function(val){
            var str;
            try {
                str = decodeURIComponent(escape(val));
            }
            catch(error){
                str=val;
            }
            return str;
        };

    }]);