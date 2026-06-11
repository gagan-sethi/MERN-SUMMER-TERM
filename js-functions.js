const students = [
    {
        name:"Abhishek",
        course: "Full Stack Development",
        marks:[22, 19, 25, 30, 27]
    },
    {
        name:"Satyarth",
        course: "Full Stack Development",
        marks:[20, 18, 24, 28, 26]
    },
    {
        name:"Rohit",
        course: "Full Stack Development",
        marks:[21, 17, 23, 29, 25]
    }, 
    {
        name:"Anjali",
        course: "Full Stack Development",
        marks:[9, 6, 2, 7, 4]
    }
]

/* Problem Statement: Convert the given objects in array in below format max marks is 150. If the percentage is above 60 then result status is pass otherwise fail. :
 [
    {
        name:"Abhishek",
        course: "Full Stack Development",
        marks:[22, 19, 25, 30, 27],
        totalMarks: 123,
        percentage: 82,
        resultStatus: "Pass" 
    },
    ...
] */

const updatedStudentData = students.map(student=>{
    const totalMarks = student.marks.reduce((acc, mark)=> {return acc + mark } , 0);
    const percentage = ((totalMarks / 150) * 100).toFixed(2);
    const resultStatus= percentage > 60 ? "Pass" : "Fail";
    return{
        ...student,
        totalMarks,
        percentage,
        resultStatus
    };
});

console.log(updatedStudentData);

// Use filter function to get the students who have passed the course

// Use filter function to get the students who have failed the course