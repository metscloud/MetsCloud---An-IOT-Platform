



module.exports={


temperature:()=>//C,F,K(with calculation),(Graphs)
{

    let data=
    {
        minimumValue:-40,
        maximumValue:1000,

  
    }
    return data
},

humidity:()=>//(Graphs)
{

    let data=
    {
        minimumValue:0,
        maximumValue:100,

  
    }
    return data
},

power:()=>//W(Graphs))
{
    let data=
    {
        minimumValue:0,
        maximumValue:10000,

  
    }
    return data

},

status:()=>//Battery ,level indications, on/off button
{
    let data=
    {
        minimumValue:0,
        maximumValue:10,

  
    }
    return data
}



}