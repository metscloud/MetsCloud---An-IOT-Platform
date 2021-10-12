

module.exports={

    LM35:()=>
    {
        let data=
        {
            sensorPIN:'1-ADC',
            key:'LM',
            minimumValue:-55,
            maximumValue:150,

        }
        return data
        

    },

    PT1001000:()=>
    {
        let data=
        {
            sensorPIN:'1-ADC',
            key:'PT',
            minimumValue:-200,
            maximumValue:850,
            
        }
        return data
        

    },
    IRRxLED:()=>
    {
        let data=
        {
            sensorPIN:'1-ADC',
            key:'RE',
            minimumValue:0,
            maximumValue:1023,
            
        }
        return data
        

    },
    LDR:()=>
    {
        let data=
        {
            sensorPIN:'1-ADC',
            key:'DR',
            minimumValue:0,
            maximumValue:1023,
            
        }
        return data
        

    },
    Potentiometer:()=>
    {
        let data=
        {
            sensorPIN:'1-ADC',
            key:'PM',
            minimumValue:0,
            maximumValue:1023,
            
        }
        return data
        

    },

    ForceSensor:()=>
    {
        let data=
        {
            sensorPIN:'1-ADC',
            key:'CE',
            minimumValue:0.1,
            maximumValue:100,
            
        }
        return data
        

    },

    FlowSensor:()=>
    {
        let data=
        {
            sensorPIN:'1-ADC',
            key:'OW',
           
            
        }
        return data
        

    },

    A3144:()=>
    {
        let data=
        {
            sensorPIN:'1-ADC',
            key:'AL',
           
            
        }
        return data
        

    },

    mq2mq4:()=>
    {
        let data=
        {
            sensorPIN:'1-ADC',
            key:'GS',
            minimumValue:0,
            maximumValue:100,
            
        }
        return data
        

    },
    mq135:()=>
    {
        let data=
        {
            sensorPIN:'1-ADC',
            key:'AR'
            
            
        }
        return data
        

    },
    mq9:()=>
    {
        let data=
        {
            sensorPIN:'1-ADC',
            key:'CO',
            maximumValue:10000
            
        }
        return data
        

    },
    MO41:()=>
    {
        let data=
        {
            sensorPIN:'1-ADC',
            key:'TU',
           
            
        }
        return data
        

    }

}