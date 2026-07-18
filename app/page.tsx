'use client'

import Image from "next/image";
import {useState} from 'react'

export default function Root() {

  const [currentTab, setCurrentTab] = useState(0)

  // see note about context, this feels wrong having to repeat the function here
  const [tabs, setTabs] = useState<Tab[]>([
    {id : 0, name : "FRONT END", color : 'red', setCurrentTab : setCurrentTab},
    {id : 1, name : "SOMETHING", color : 'purple', setCurrentTab : setCurrentTab},
    // TODO: figure out how to make this tab a special case and have not just a solid color for a tab, or maybe each tab gets their own style
    {id : 2, name : "PRIMITIVE_ARPG", color : 'darkGreen', setCurrentTab : setCurrentTab},
  ])

  
  return (
    <div
    style = {{
      display : 'flex',
      flexDirection : 'column',
      backgroundColor : 'navy',
      alignContent : 'center',
      height : '100vh',
    }}>
      <div
      style = {{
        textAlign : 'center',
        backgroundColor : 'black',
      }}>
        Some text thing here

      </div>
      <TabBar tabs = {tabs} setCurrentTab = {setCurrentTab} />
      <ProjectOverview/>
    </div>
  )
}

interface Tab {
  id : number,
  name : string,
  color : string,
  // TODO: look into context more, can have global things and no need to repeat this every tab?
  setCurrentTab : React.Dispatch<React.SetStateAction<number>>
}

// container that has description and images maybe
function ProjectOverview() {

  return (
    <div
    style = {{
      backgroundColor : 'darkorange',
      flexGrow : '1',
    }}>
    </div>
  )
}

interface TabBarProps {
  tabs : Tab[],
  setCurrentTab : React.Dispatch<React.SetStateAction<number>>
}
function TabBar({tabs, setCurrentTab} : TabBarProps) {

  return (
    <div
    style = {{
      display : 'flex'
    }}>
      {
        tabs.map((tab) => (
          <Tab
            key = {tab.id}
            id = {tab.id}
            name = {tab.name}
            color = {tab.color}
            setCurrentTab={setCurrentTab}
          />
        ))
      }
    </div>
  )
}

function Tab({id, name, color, setCurrentTab} : Tab) {

  const handleMouseDown = () => {
    setCurrentTab(id)
  }

  return (
    <div
      style = {{
        backgroundColor : color,
        flexGrow : '1',
        textAlign : 'center',
      }}
      onMouseDown={handleMouseDown}
    >
      {name}
    </div>
  )
}