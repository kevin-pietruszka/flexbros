import { IonCardTitle, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonButton, IonRow, IonGrid, IonCol, IonSelect, IonSelectOption, IonProgressBar, IonPopover } from '@ionic/react';
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { checkPaidUser, getsUsersRoutines, readRoutine } from "../db"
import { auth } from '../firebase';
import { Routine } from "../routine"
import "./Global.css"

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
var colorMap : Map<string, string>
var workoutMap : Map<string, string>
var date : Date 
var week : string []
var month : string [][]
var workouts : string[]
var routine_ : Routine
var workoutIndex : number 

const Calendar: React.FC = () => {
  let history = useHistory()
  
  const [userID, setUserID] = useState("");
  const [premiumStatus, setPremiumStatus] = useState(false);
  const [routines, setRoutines] = useState<string[]>([])
  const [routineIndex, setRoutineIndex] = useState<number>(0)
  const [routine, setRoutine] = useState<Routine>() //in the useState function 
  const [monthOffset, setMonthOffset] = useState<number>(0)
  const [colors, setColors] = useState<string[]>(["skyblue", "bluishgreen", "vermilion", "yellow", "reddishpurple", "blue", "orange"])
  const [showPopover, setShowPopover] = useState<boolean>(false)

  useEffect(() => {
      if (auth.currentUser != null) {
          setUserID(auth.currentUser.uid);
      } else {
          setUserID("A4A2aPnIz2VH39FsbGkPwZnzYM43");
      }
  }, []);
  
  useEffect( () => {

    // Call getUserRoutines for string array and have a dropdown use this array for selection
    if (userID !== "") {
      getsUsersRoutines(userID).then((result) => setRoutines(result)).catch((err) => console.log(err))

      checkPaidUser(userID).then((result) => setPremiumStatus(result));
    }

  }, [userID])

  useEffect( () => {

    const getRoutine = (routine : any) => {
      return routine
    }

    if (routines.length != 0 && userID != "") {
      readRoutine(routines[routineIndex], userID).then((result) => setRoutine(getRoutine(result))).catch((err) => console.log(err))
    }
    
  }, [routines, routineIndex, userID, colors])

  function swapColors(workoutIndex : number, newColor : string) {
    let workout = workouts[workoutIndex]
    let oldColor = colorMap.get(workout)

    var colorIndex1 = -1
    var colorIndex2 = -1
    
    for (let i = 0; i < colors.length; i++) {
      if (colors[i] === newColor) {
        colorIndex1 = i
      } else if (colors[i] === oldColor) {
        colorIndex2 = i
      }
    }

    var newColors = colors

    newColors[colorIndex2] = newColor
    if (oldColor != undefined) {
      newColors[colorIndex1] = oldColor
    }

    setColors(newColors)
    setShowPopover(false)
  }

  function ChooseDay (day: string) {
    date = new Date(monthYear.getFullYear(), monthYear.getMonth(), parseInt(day))
    history.push({
      pathname: '/CalendarDay',
      state: day
    })
  }

  var monthYear = new Date()
  monthYear.setMonth(monthYear.getMonth()+monthOffset)

  var dayOfWeekStart = new Date(monthYear.getFullYear(), monthYear.getMonth(), 1).getDay()
  var daysInMonth = new Date(monthYear.getFullYear(), monthYear.getMonth()+1, 0).getDate()
  var daysInLastMonth = new Date(monthYear.getFullYear(), monthYear.getMonth(), 0).getDate()

  if (routine != undefined) {
    routine_ = routine

    // get workout routine for a week
    week = ['','','','','','','']
    workouts = []
    colorMap = new Map<string, string>()
    workoutMap = new Map<string, string>()
    let i = 0

    routine.workouts.forEach((workout) => {
      workouts.push(workout.workoutName)
      colorMap.set(workout.workoutName, colors[i])
      workoutMap.set(colors[i], workout.workoutName)
      i++

      workout.days.forEach((day) => {
        if (day == 'SUN') {
          week[0] = workout.workoutName
        } else if (day == 'MON') {
          week[1] = workout.workoutName
        } else if (day == 'TUE') {
          week[2] = workout.workoutName
        } else if (day == 'WED') {
          week[3] = workout.workoutName
        } else if (day == 'THU') {
          week[4] = workout.workoutName
        } else if (day == 'FRI') {
          week[5] = workout.workoutName
        } else if (day == 'SAT') {
          week[6] = workout.workoutName
        }
      })
    })

    workouts.push('Rest')
    colorMap.set('Rest', colors[colorMap.size])
    colorMap.set('Other', 'medium')

    for (let i = 0; i < 7; i++) {
      if (week[i] === '') {
        week[i] = 'Rest'
      }
    }
  
    month = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]  ]

    for (let i = 0; i < dayOfWeekStart; i++) {
      month[i] = []
      month[i].push((daysInLastMonth-dayOfWeekStart+1+i).toString())
      month[i].push("Other")
      month[i].push('true')
    }

    for (let i = 1; i <= daysInMonth; i++) {
      month[dayOfWeekStart-1+i] = []
      month[dayOfWeekStart-1+i].push((i).toString())
      month[dayOfWeekStart-1+i].push(week[new Date(monthYear.getFullYear(), monthYear.getMonth(), i).getDay()])
      month[i].push('false')
    }
  
    for (let i = dayOfWeekStart+daysInMonth; i < 42; i++) {
      month[i] = []
      month[i].push((i-daysInMonth-dayOfWeekStart+1).toString())
      month[i].push("Other")
      month[i].push('true')
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle class="ion-text-center">FlexBros</IonTitle>
          {routine === undefined && <IonProgressBar type='indeterminate'></IonProgressBar>}
        </IonToolbar>
      </IonHeader>
      {routine != undefined && <IonContent fullscreen>
        <IonCard>
          <IonCardTitle class="ion-text-center">
            {premiumStatus && <IonSelect interface='popover' onIonChange={(e : any) => setRoutineIndex(e.detail.value)} placeholder={routines[routineIndex]}>
              {routines.length >= 1 && <IonSelectOption class="ion-text-center" value={0}>{routines[0]}</IonSelectOption>}
              {routines.length >= 2 && <IonSelectOption class="ion-text-center" value={1}>{routines[1]}</IonSelectOption>}
              {routines.length >= 3 && <IonSelectOption class="ion-text-center" value={2}>{routines[2]}</IonSelectOption>}
              {routines.length >= 4 && <IonSelectOption class="ion-text-center" value={3}>{routines[3]}</IonSelectOption>}
            </IonSelect>}
            {!premiumStatus && routines[routineIndex]}
          </IonCardTitle>
        </IonCard>
        <IonCard>
          <IonGrid class="ion-text-center">
          <IonRow>
            <IonCol></IonCol>
            <IonCol></IonCol>
            <IonCol><IonButton id="prev_button"  color='blue' onClick={() => {setMonthOffset(monthOffset-1)}}>Prev</IonButton></IonCol>
            <IonCol>
              <IonRow><IonCardTitle id="month_title">{months[monthYear.getMonth()]}</IonCardTitle></IonRow>
              <IonRow><IonCardTitle id="year_title">{monthYear.getFullYear()}</IonCardTitle></IonRow>
            </IonCol>
            <IonCol><IonButton id="next_button" color='blue' onClick={() => {setMonthOffset(monthOffset+1)}}>Next</IonButton></IonCol>
            <IonCol></IonCol>
            <IonCol></IonCol>
          </IonRow>
            <IonRow>
              <IonCol>Sun</IonCol>
              <IonCol>Mon</IonCol>
              <IonCol>Tue</IonCol>
              <IonCol>Wed</IonCol>
              <IonCol>Thu</IonCol>
              <IonCol>Fri</IonCol>
              <IonCol>Sat</IonCol>
            </IonRow>
            <IonRow>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[0][0])} size='small' color={colorMap.get(month[0][1])} disabled={(month[0][2] === 'true')}>{month[0][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[1][0])} size='small' color={colorMap.get(month[1][1])} disabled={(month[1][2] === 'true')}>{month[1][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[2][0])} size='small' color={colorMap.get(month[2][1])} disabled={(month[2][2] === 'true')}>{month[2][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[3][0])} size='small' color={colorMap.get(month[3][1])} disabled={(month[3][2] === 'true')}>{month[3][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[4][0])} size='small' color={colorMap.get(month[4][1])} disabled={(month[4][2] === 'true')}>{month[4][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[5][0])} size='small' color={colorMap.get(month[5][1])} disabled={(month[5][2] === 'true')}>{month[5][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[6][0])} size='small' color={colorMap.get(month[6][1])} disabled={(month[6][2] === 'true')}>{month[6][0]}</IonButton></IonCol>
            </IonRow>
            <IonRow>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[7][0])} size='small' color={colorMap.get(month[7][1])} disabled={(month[7][2] === 'true')}>{month[7][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[8][0])} size='small' color={colorMap.get(month[8][1])} disabled={(month[8][2] === 'true')}>{month[8][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[9][0])} size='small' color={colorMap.get(month[9][1])} disabled={(month[9][2] === 'true')}>{month[9][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[10][0])} size='small' color={colorMap.get(month[10][1])} disabled={(month[10][2] === 'true')}>{month[10][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[11][0])} size='small' color={colorMap.get(month[11][1])} disabled={(month[11][2] === 'true')}>{month[11][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[12][0])} size='small' color={colorMap.get(month[12][1])} disabled={(month[12][2] === 'true')}>{month[12][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[13][0])} size='small' color={colorMap.get(month[13][1])} disabled={(month[13][2] === 'true')}>{month[13][0]}</IonButton></IonCol>
            </IonRow>
            <IonRow>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[14][0])} size='small' color={colorMap.get(month[14][1])} disabled={(month[14][2] === 'true')}>{month[14][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[15][0])} size='small' color={colorMap.get(month[15][1])} disabled={(month[15][2] === 'true')}>{month[15][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[16][0])} size='small' color={colorMap.get(month[16][1])} disabled={(month[16][2] === 'true')}>{month[16][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[17][0])} size='small' color={colorMap.get(month[17][1])} disabled={(month[17][2] === 'true')}>{month[17][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[18][0])} size='small' color={colorMap.get(month[18][1])} disabled={(month[18][2] === 'true')}>{month[18][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[19][0])} size='small' color={colorMap.get(month[19][1])} disabled={(month[19][2] === 'true')}>{month[19][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[20][0])} size='small' color={colorMap.get(month[20][1])} disabled={(month[20][2] === 'true')}>{month[20][0]}</IonButton></IonCol>
            </IonRow>
            <IonRow>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[21][0])} size='small' color={colorMap.get(month[21][1])} disabled={(month[21][2] === 'true')}>{month[21][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[22][0])} size='small' color={colorMap.get(month[22][1])} disabled={(month[22][2] === 'true')}>{month[22][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[23][0])} size='small' color={colorMap.get(month[23][1])} disabled={(month[23][2] === 'true')}>{month[23][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[24][0])} size='small' color={colorMap.get(month[24][1])} disabled={(month[24][2] === 'true')}>{month[24][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[25][0])} size='small' color={colorMap.get(month[25][1])} disabled={(month[25][2] === 'true')}>{month[25][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[26][0])} size='small' color={colorMap.get(month[26][1])} disabled={(month[26][2] === 'true')}>{month[26][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[27][0])} size='small' color={colorMap.get(month[27][1])} disabled={(month[27][2] === 'true')}>{month[27][0]}</IonButton></IonCol>
            </IonRow>
            <IonRow>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[28][0])} size='small' color={colorMap.get(month[28][1])} disabled={(month[28][2] === 'true')}>{month[28][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[29][0])} size='small' color={colorMap.get(month[29][1])} disabled={(month[29][2] === 'true')}>{month[29][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[30][0])} size='small' color={colorMap.get(month[30][1])} disabled={(month[30][2] === 'true')}>{month[30][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[31][0])} size='small' color={colorMap.get(month[31][1])} disabled={(month[31][2] === 'true')}>{month[31][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[32][0])} size='small' color={colorMap.get(month[32][1])} disabled={(month[32][2] === 'true')}>{month[32][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[33][0])} size='small' color={colorMap.get(month[33][1])} disabled={(month[33][2] === 'true')}>{month[33][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[34][0])} size='small' color={colorMap.get(month[34][1])} disabled={(month[34][2] === 'true')}>{month[34][0]}</IonButton></IonCol>
            </IonRow>
            {month[35][1] != 'Other' && <IonRow>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[35][0])} size='small' color={colorMap.get(month[35][1])} disabled={(month[35][2] === 'true')}>{month[35][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[36][0])} size='small' color={colorMap.get(month[36][1])} disabled={(month[36][2] === 'true')}>{month[36][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[37][0])} size='small' color={colorMap.get(month[37][1])} disabled={(month[37][2] === 'true')}>{month[37][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[38][0])} size='small' color={colorMap.get(month[38][1])} disabled={(month[38][2] === 'true')}>{month[38][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[39][0])} size='small' color={colorMap.get(month[39][1])} disabled={(month[39][2] === 'true')}>{month[39][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[40][0])} size='small' color={colorMap.get(month[40][1])} disabled={(month[40][2] === 'true')}>{month[40][0]}</IonButton></IonCol>
              <IonCol><IonButton id="day_button" onClick={() => ChooseDay(month[41][0])} size='small' color={colorMap.get(month[41][1])} disabled={(month[41][2] === 'true')}>{month[41][0]}</IonButton></IonCol>
            </IonRow>}
          </IonGrid>
        </IonCard>
        <IonCard class="ion-text-center">
          {workouts.length >= 1 && <IonButton onClick={() => {workoutIndex = 0; setShowPopover(true)}} color={colorMap.get(workouts[0])}>{workouts[0]}</IonButton>}
          {workouts.length >= 2 && <IonButton onClick={() => {workoutIndex = 1; setShowPopover(true)}} color={colorMap.get(workouts[1])}>{workouts[1]}</IonButton>}
          {workouts.length >= 3 && <IonButton onClick={() => {workoutIndex = 2; setShowPopover(true)}} color={colorMap.get(workouts[2])}>{workouts[2]}</IonButton>}
          {workouts.length >= 4 && <IonButton onClick={() => {workoutIndex = 3; setShowPopover(true)}} color={colorMap.get(workouts[3])}>{workouts[3]}</IonButton>}
          {workouts.length >= 5 && <IonButton onClick={() => {workoutIndex = 4; setShowPopover(true)}} color={colorMap.get(workouts[4])}>{workouts[4]}</IonButton>}
          {workouts.length >= 6 && <IonButton onClick={() => {workoutIndex = 5; setShowPopover(true)}} color={colorMap.get(workouts[5])}>{workouts[5]}</IonButton>}
          {workouts.length >= 7 && <IonButton onClick={() => {workoutIndex = 6; setShowPopover(true)}} color={colorMap.get(workouts[6])}>{workouts[6]}</IonButton>}
        </IonCard>
        <IonPopover class="ion-text-center" isOpen={showPopover} onDidDismiss={e => setShowPopover(false)}> Choose Workout Color
            <IonGrid class="ion-text-center">
              <IonRow>
                <IonCol><IonButton onClick={() => swapColors(workoutIndex,"skyblue")} id="color_button" color={"skyblue"}></IonButton></IonCol>
                <IonCol><IonButton onClick={() => swapColors(workoutIndex,"bluishgreen")} id="color_button" color={"bluishgreen"}></IonButton></IonCol>
                <IonCol><IonButton onClick={() => swapColors(workoutIndex,"vermilion")} id="color_button" color={"vermilion"}></IonButton></IonCol>
                <IonCol><IonButton onClick={() => swapColors(workoutIndex,"yellow")} id="color_button" color={"yellow"}></IonButton></IonCol>
              </IonRow>
              <IonRow>
                <IonCol><IonButton onClick={() => swapColors(workoutIndex,"reddishpurple")} id="color_button" color={"reddishpurple"}></IonButton></IonCol>
                <IonCol><IonButton onClick={() => swapColors(workoutIndex,"blue")} id="color_button" color={"blue"}></IonButton></IonCol>
                <IonCol><IonButton onClick={() => swapColors(workoutIndex,"orange")} id="color_button" color={"orange"}></IonButton></IonCol>
              </IonRow>
              <IonRow>
              </IonRow>
            </IonGrid>
          </IonPopover>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 1</IonTitle>
          </IonToolbar>
        </IonHeader>
      </IonContent>}
    </IonPage>
  );
};

export function getSelectedDate() { return date }
export function getLoadedRoutine() { return routine_ }
export default Calendar;
