const decoder = new TextDecoder('utf-16')

export function parseReplay(uint8Ary) {
  const dataView = new DataView(uint8Ary.buffer)
  const bufferLen = dataView.byteLength

  let position = 273
  let bufLen
  bufLen = readInt32()
  const exeInf = readString(bufLen)
  const version = exeInf.split(' ')[1]

  skipBytes(12)
  if (version >= 305820) {
    bufLen = readInt32()
    readString(bufLen)
  }
  bufLen = readInt32()
  readString(bufLen)
  skipBytes(60)
  if (version >= 305820) {
    skipBytes(4)
  }
  readInfString('gamename')
  readInfInt32('gametype')
  readInfBool('gamerestored')
  readInfInt32('gamecurplayers')
  readInfInt32('gamenumplayers')
  readInfBool('gamefreeforall')
  readInfBool('gamenomadstart')
  readInfInt32('gamemapsize');
  readInfString('gamemapname')
  readInfInt32('gamemaptype');

  const map = readInfString('gamefilename')
  readInfString('gamefilenameext');
  readInfInt32('gamefilecrc');
  readInfBool('gamerestrictpause');
  readInfInt32('gamemapresources')
  readInfBool('gameteamshareres');
  readInfBool('gameteamsharepop');
  readInfBool('gameteamlock');
  readInfBool('gameteambalanced');
  readInfInt32('gamerandomseed');
  readInfBool('gamermdebug');
  readInfBool('gamestartwithtreaty');
  readInfInt32('gamedifficulty');
  readInfBool('gamerecordgame');
  readInfInt32('gamestartingage');

  readInfInt32('gameendingage')

  readInfInt32('gamespeed');
  readInfInt32('gamemapvisibility');
  readInfInt32('gamemodetype');
  readInfInt32('gamehandicapmode');
  readInfBool('gameallowcheats');
  readInfInt32('gamehosttime')
  readInfString('gamepassword');
  readInfInt32('gamelatency');


  readInfInt32('homecitylevelmin');
  readInfInt32('homecitylevelmax');
  readInfString('custommapname')
  readInfInt32('gamenorush');
  readInfBool('gametrademonopoly');
  readInfBool('gameblockade');
  readInfBool('gamekoth');
  readInfInt32('gamescenariogameid');
  readInfInt32('gamecontentid');

  readInfBool('gameismpscenario');
  readInfBool('gameismpcoop');
  readInfString('gamegcgameid');
  readInfInt32('gamegcgametype');
  readInfInt32('gamegcnumturns');
  readInfBool('gamehiddencards');
  readInfBool('gamepickcardsfirst');
  readInfInt32('gamecampaignselected');
  readInfInt32('gamecampaignprogress');
  readInfInt32('gamecampaignfarthest');
  readInfInt32('gamecampaignprogress1');
  readInfInt32('gamecampaignfarthest1');
  readInfInt32('gamecampaignprogress2');

  readInfInt32('gamecampaignfarthest2act1');
  readInfInt32('gamecampaignfarthest2act2');
  readInfInt32('gamecampaignfarthest2act3');

  readInfBool('gamecampaignshownhcnote');
  readInfBool('gamecampaignshownhcnote2');
  readInfBool('gamecampaignshownhcnote3');

  let playerObj = readGamePlayer()
  readInfString('gameguid');
  readInfString('gamecontinuemainfilename');
  readInfString('gamecontinuecampaignfilename');
  readInfString('gamecontinuecampaignscenarioname');
  readInfInt32('gamecontinuecampaignscenarionameid');
  readInfInt32('gamecontinuecampaignid');
  readInfInt32('gamecontinuecampaignscenarioid');
  readInfString('gameregion');
  readInfString('gamelanguage');


  readInfInt32('gamecustommapfilecount');
  readInfInt32('gamestartingresources');
  readInfInt32('mapsetfilter');
  readInfInt32('mapmodid');
  readInfInt32('mapmodcrc');
  readInfInt32('gamempcoopcampaignid');
  readInfInt32('gamempcoopscenarioid');

  const teamsObj = searchTeam()
  // console.log(teamsObj);
  playerObj = parseJson(playerObj, teamsObj)

  function searchTeam() {
    const teamsObj = {}
    const seachBytes = [0x54, 0x45]
    position = sunday(uint8Ary, seachBytes)
    
    while (position !== -1) {
      skipBytes(6)
      const key = readInt32()
      if (key === 12) {
        const teamId = readInt32()
        const teamName = readInfo()
        teamsObj[`team${teamId}`] = {
          id: teamId,
          name: teamName,
          resign: 0,
          members: []
        }
        // console.log(teamId, teamName);
        const teamMembersCount = readInt32()
        for (let i = 0; i < teamMembersCount; i++) {
          const playerId = readInt32()
          teamsObj[`team${teamId}`].members.push(playerId)
          // console.log(playerId);
        }
      }
      // console.log(key)
      position = sunday(uint8Ary, seachBytes, position)
    }
    return teamsObj
  }

  let duration = 0
  function seachDuration() {
    const seachBytes = [0x9a, 0x99, 0x99, 0x3d]
    position = sunday(uint8Ary, seachBytes)
    if (position === -1) return
    skipBytes(142)
    const msgLen = readInt32()
    for (let i = 0; i < msgLen; i++) {
      readInt32(); // from
      readInt32(); // to
      bufLen = readInt32();
      skipBytes(1)
    }
    duration += readInt8()
  }

  seachDuration()

  function search() {
    const seachBytes = [0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x19]
    position = sunday(uint8Ary, seachBytes)
    
    while (position !== -1) {
      // console.log('19:' + position);
      skipBytes(113)
      if (bufferLen === position) {
        console.log('break');
        return
      }
      const command = readInt8()
      // console.log(command)
      let hasCommands = true;

      switch (command){
        case 33:
        case 65:
        case 161:
        case 193:
          break;
        case 1:
        case 129:
          hasCommands = false;
          break;
        case 35:
        case 37:
        case 41:
        case 67:
        case 73:
        case 163:
        case 165:
        case 169:
        case 195:
        case 201:
          skipBytes(4);
          break;
        case 3:
        case 5:
        case 9:
        case 131:
        case 133:
        case 137:
          skipBytes(4);
          hasCommands = false;
          break;
        case 39:
        case 43:
        case 45:
        case 75:
        case 167:
        case 171:
        case 173:
        case 203:
          skipBytes(8);
          break;
        case 7:
        case 11:
        case 13:
        case 135:
        case 139:
        case 141:
          skipBytes(8);
          hasCommands = false;
          break;
        case 47:
        case 175:
        case 207:
          skipBytes(12);
          break;
        case 15:
        case 143:
          skipBytes(12);
          hasCommands = false;
          break;
        case 49:
        case 177:
          skipBytes(36);
          break;
        case 17:
        case 145:
          skipBytes(36);
          hasCommands = false;
          break;
        case 19:
        case 21:
        case 25:
        case 147:
        case 149:
        case 153:
          skipBytes(40);
          hasCommands = false;
          break;
        case 51:
        case 53:
        case 57:
        case 179:
        case 181:
        case 185:
          skipBytes(40);
          break;
        case 55:
        case 59:
        case 61:
        case 183:
        case 187:
        case 189:
          skipBytes(44);
          break;
        case 23:
        case 27:
        case 29:
        case 151:
        case 155:
        case 157:
          skipBytes(44);
          hasCommands = false;
          break;
        case 63:
        case 191:
        case 223:
          skipBytes(48);
          break;
        case 31:
        case 159:
          skipBytes(48);
          hasCommands = false;
          break;
        default:
          console.log(`Unknown main command: ${command}`);
          position = position = sunday(uint8Ary, seachBytes, position)
          continue
      }

      const messageCount = readInt32()

      for (let i = 0; i < messageCount; i++) {
        const sender = readInt32()
        const reciever = readInt32()
        bufLen = readInt32()
        const msg = readString(bufLen)

        skipBytes(1)
      }

      duration += readInt8()
      let commandsCount = 0

      if (hasCommands) {
        if ([65, 67, 73, 75, 193, 195, 201, 203, 207, 223].includes(command)) {
          commandsCount = readInt32()
        } else {
          commandsCount = readInt8()
        }
        for (let i = 0; i < commandsCount; i++) {
          readInt8()
          
          const commandId = readInt32()
          // console.log(`A${commandId}`)
          
          if (commandId === 14) {
            skipBytes(12)
          }
          //  else if (commandId === 2) {
          //   skipBytes(4)
          // }

          readInt8()
          const playerId = readInt32();
          readInt32(-1)
          readInt32(-1)
          readInt32(3)
          const unknown0 = readInt32();
          if (unknown0 === 1) {
            readInt32();
          } else if (unknown0 !== 0) {
            console.log('unknown');
          }
          let unknown1 = readInt32();
          const selectedCount = readInt32();

          for (let j = 0; j < selectedCount; j++) {
            readInt32()
          }

          let unknown2 = readInt32();
          skipBytes(unknown2 * 12)

          const unknownCount = readInt32();

          for (let j = 0; j < unknownCount; j++) {
            readInt8()
          }
          readInt8(0)
          readInt32(0)
          readInt32(0)
          readInt32(0)
          readInt32(-1)

          skipBytes(4)

          // console.log(position)
          // console.log(`commandId${commandId}`);
          // if (43019511 === position) position +=2
          if (commandId === 0) {
            skipBytes(24)
            // if (unknown2 === 0) {
            //   skipBytes(20)
            // } else if (unknown2 === 1) {
            //   skipBytes(20)
            // }
            if (readInt8() === 255) {
              skipBytes(7)
            } else {
              skipBytes(-1)
            }
          } else if (commandId === 1) {
            skipBytes(4)
          } else if (commandId === 2) {
            // testObj.push({})
            if (unknown1 == 0) {
              skipBytes(2)
            } else if (unknown1 == 2) {
              skipBytes(2)
            }
            // skipBytes(12)
            skipBytes(14)
          } else if (commandId === 3) {
            skipBytes(44)
          } else if (commandId === 4) {
            skipBytes(25)
          } else if (commandId === 6) {
            skipBytes(36)
          } else if (commandId === 7) {
            skipBytes(1)
          } else if (commandId === 9) {
            // skipBytes(36)
          } else if (commandId === 12) {
            skipBytes(36)
            if (unknown1 === 0) {
              skipBytes(1)
            }
          } else if (commandId === 13) {
            skipBytes(12)
          } else if (commandId === 14) {
            // skipBytes(36)
          } else if (commandId === 16) {
            skipBytes(4)
            const resignPlayer = readInt32()
            for (const team of Object.values(teamsObj)) {
              if (team.members.includes(resignPlayer)) team.resign += 1
            }
            skipBytes(5)
          } else if (commandId === 18) {
            skipBytes(4)
          } else if (commandId === 19) {
            skipBytes(17)
          } else if (commandId === 23) {
            skipBytes(6)
          } else if (commandId === 24) {
            skipBytes(12)
          } else if (commandId === 25) {
            skipBytes(6)
          } else if (commandId === 26) {
            skipBytes(4)
          } else if (commandId === 34) {
            // skipBytes(6)
          } else if (commandId === 35) {
            skipBytes(4)
          } else if (commandId === 37) {
            skipBytes(5)
          } else if (commandId === 41) {
            const control1 = readInt32()
            const control2 = readInt32()
            const control3 = readInt32()
            skipBytes(8)
            unknown1 = readInt32()
            if (control1 === 1) {
              unknown2 = readInt32();
              let unknown3 = -1;
              if (unknown2 === 1){
                unknown3 = readInt32();
                
              }
              skipBytes(13)
              // if (unknown2 == 1){
              //   skipBytes(12)
              // } else {
              //   skipBytes(12)
              // }
              if (control1 == 3) {
                skipBytes(13)
              }
            }
          } else if (commandId === 44) {
            skipBytes(8)
          } else if (commandId === 46) {
            skipBytes(8)
          } else if (commandId === 48) {
            skipBytes(9)
          } else if (commandId === 53) {
            skipBytes(8)
          } else if (commandId === 57) {
            skipBytes(12)
          } else if (commandId === 58) {
            skipBytes(4)
          } else if (commandId === 61) {
            skipBytes(8)
          } else if (commandId === 62) {
            skipBytes(4)
          } else if (commandId === 63) {
            skipBytes(16)
          } else if (commandId === 64) {
            // skipBytes(12)
          } else if (commandId === 65) {
            skipBytes(4)
          } else if (commandId === 66) {
            skipBytes(8)
          } else if (commandId === 67) {
            skipBytes(12)
          } else if (commandId === 71) {
            skipBytes(4)
          } else if (commandId === 72) {
            skipBytes(16)
          } else if (commandId === 73) {
            // skipBytes(12)
          } else if (commandId === 80) {
            skipBytes(8)
          }
        }

      }
      position = sunday(uint8Ary, seachBytes, position)
    }
  }
  search()

  
  const winner = (() => {
    const sortAry = Object.keys(teamsObj).sort((teamA, teamB) => teamsObj[teamB].resign - teamsObj[teamA].resign)
    if (teamsObj[sortAry[0]].resign === 0) return 0
    const [lastItem] = sortAry.slice(-1)
    return teamsObj[lastItem].id
  })()

  return {
    players: playerObj,
    winner,
    duration,
    map,
    version
  }

function skipBytes(length) {
  position += length
}

function readInt8(isVerify) {
  const int8 = dataView.getUint8(position)
  position += 1
  if (typeof isVerify !== 'undefined') {
    if (isVerify !== int8) throw new Error(`Validation Failure ${isVerify}`)
  }
  return int8
}

function readInt32(isVerify) {
  const int32 = dataView.getInt32(position, true)
  position += 4
  if (typeof isVerify !== 'undefined') {
    if (isVerify !== int32) throw new Error(`Validation Failure ${isVerify}`)
  }
  return int32
}

function readFloat() {
  const bool = dataView.getFloat32(position, true)
  position += 4
  return bool
}

function readString(length) {
  const end = position + length * 2
  const string = decoder.decode(dataView.buffer.slice(position, end))
  position += length * 2
  return string
}

function readInfo() {
  const bufLen = readInt32()
  return readString(bufLen)
}

function readInfString(name) {
  let bufLen
  let string

  bufLen = readInt32()
  string = readString(bufLen)
  if (string !== name) console.log(`Is ${string}, Not ${name}`)
  
  const bufType = readInt32()
  if (bufType !== 9) console.log('Not String')
  bufLen = readInt32()
  string = readString(bufLen)
  return string
}

function readInfInt32(name) {
  let bufLen
  let string

  bufLen = readInt32()
  string = readString(bufLen)
  if (string !== name) console.log(`Is ${string}, Not ${name}`)

  const bufType = readInt32()
  if (bufType !== 2) console.log('Not Int32')
  string = readInt32()
  return string
}

function readInfBool(name) {
  let bufLen
  let string

  bufLen = readInt32()
  string = readString(bufLen)
  if (string !== name) console.log(`Is ${string}, Not ${name}`)
  
  const bufType = readInt32()

  if (bufType !== 5) console.log('Not Boolean')

  string = readInt8()
  return string
}

function readInfFloat(name) {
  let bufLen
  let string

  bufLen = readInt32()
  string = readString(bufLen)
  if (string !== name) console.log(`Is ${string}, Not ${name}`)

  const bufType = readInt32()
  if (bufType !== 1) console.log('Not Float')
  string = readFloat()
  return string
}

function readGamePlayer() {
  const playerObj = {}
  for (let i = 0; i < 13; i++) {
    const playerNum = `player${i}`
    playerObj[playerNum]={
      name: readInfString(`gameplayer${i}name`),
      teamid: readInfInt32(`gameplayer${i}teamid`),
      clan: readInfString(`gameplayer${i}clan`),
      color: readInfInt32(`gameplayer${i}color`),
      civ: readInfInt32(`gameplayer${i}civ`),
      type: readInfInt32(`gameplayer${i}type`),
      status: readInfInt32(`gameplayer${i}status`),
      rating: readInfFloat(`gameplayer${i}rating`),
      handicap: readInfFloat(`gameplayer${i}handicap`),
      aipersonality: readInfString(`gameplayer${i}aipersonality`),
      avatarid: readInfString(`gameplayer${i}avatarid`),
      rank: readInfString(`gameplayer${i}rank`),
      powerrating: readInfString(`gameplayer${i}powerrating`),
      totalxp: readInfString(`gameplayer${i}totalxp`),
      winratio: readInfString(`gameplayer${i}winratio`),
      ready: readInfBool(`gameplayer${i}ready`),
      hclocation: readInfInt32(`gameplayer${i}hclocation`),
      hclevel: readInfInt32(`gameplayer${i}hclevel`),
      hcfilename: readInfString(`gameplayer${i}hcfilename`),
      homecityname: readInfString(`gameplayer${i}homecityname`),
      explorername: readInfString(`gameplayer${i}explorername`),
      questid: readInfInt32(`gameplayer${i}questid`),
      queststatus: readInfInt32(`gameplayer${i}queststatus`),
      id: readInfInt32(`gameplayer${i}id`),
      civishidden: readInfBool(`gameplayer${i}civishidden`),
      civwasrandom: readInfBool(`gameplayer${i}civwasrandom`),
      explorerskinid: readInfInt32(`gameplayer${i}explorerskinid`)
    }
  }
  return playerObj
}
}

function sunday(array, search, fromIndex = 0) {
  const searchLen = search.length
  const searchLast = search[searchLen - 1]
  let index = array.indexOf(searchLast, fromIndex + searchLen - 1)

  while (index !== -1) {
    for (let i = searchLen - 1; i > 0; i--) {
      if (search[i - 1] !== array[index - searchLen + i]) {
        const searchIndex = search.lastIndexOf(array[index + 1])
        const offset = searchIndex === -1 ? index + searchLen + 1 : index + searchLen - searchIndex
        index = array.indexOf(searchLast, offset)
        break
      }
      if (i === 1) return index - searchLen + 1
    }
  }
  return -1
}

function parseJson(palyers, teams) {
  const playersAry = []
  const civMap = new Map([
    [1, 'Spanish'],
    [2, 'British'],
    [3, 'French'],
    [4, 'Portuguese'],
    [5, 'Dutch'],
    [6, 'Russians'],
    [7, 'Germans'],
    [8, 'Ottomans'],
    [15, 'XPIroquois'],
    [16, 'XPSioux'],
    [17, 'XPAztec'],
    [19, 'Japanese'],
    [20, 'Chinese'],
    [21, 'Indians'],
    [27, 'DEInca'],
    [28, 'DESwedish'],
    [38, 'DEAmericans'],
    [39, 'DEEthiopians'],
    [40, 'DEHausa'],
    [42, 'DEMexicans'],
    [44, 'DEItalians'],
    [45, 'DEMaltese']
  ])

  for (const palyer of Object.keys(palyers)) {
    const { id, civ, name } = palyers[palyer]
    if (id === 0 || id === -1) continue

    let teamId

    for (const team of Object.values(teams)) {
      if (team.members.includes(id)) teamId = team.id
    }
    playersAry.push({
      name,
      teamId,
      civ: civMap.get(civ)
    })
  }

  return playersAry.sort((playerA, playerB) => playerA.teamId - playerB.teamId)
}