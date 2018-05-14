let _$ = {
  __attr: function(node, name, setterCallback) {
    return function(val) {
      if (arguments.length == 0 || typeof val === 'undefined' || val == null) {
        /*
         Allows the function to be used as a getter.
         */
        let val = node.getAttribute(name);
        if (val == null) {
          return null;
        }

        let number = parseFloat(val);
        if (typeof number === 'number' && !isNaN(number)) {
          return number;
        }
        return val;
      }

      let att = document.createAttribute(name);
      if (setterCallback == null || typeof setterCallback === 'undefined') {
        att.value = val;
      } else {
        att.value = setterCallback(val);
      }
      node.setAttributeNode(att);

      return node;
    }
  },
  _id: function(node) {
    return this.__attr(node, 'id');
  },
  _style: function(node) {
    return this.__attr(node, 'style');
  },
  _class: function(node) {
    return this.__attr(node, 'class');
  },
  _attr: function(node) {
    return function(attrName, val) {
      if (arguments.length == 1) {
        /** If there is no value being set, try to
         *  return the current value of the attribute
         */
        return node.getAttribute(attrName);
      }

      let att = document.createAttribute(attrName);
      att.value = val;
      node.setAttributeNode(att);
      return node;
    }
  },
}

function $id(name) {
  var node = null;

  if (name == null || name === "undefined") {
    return node;
  } else if (typeof name === 'string') {
    node = document.getElementById(name);
  } else if (name.setAttributeNode != null) {
    /* name is an element */
    node = name;
  }

  if (node != null) {
    /* Bind helper functions */
    node.$id = _$._id(node);
    /* Add query selector shorthand */
    node.child = (childSelectorString) => {
      let child = node.querySelector(childSelectorString);
      /* Extend child */
      return $id(child);
    }
  }

  return node;
}

function newMetrics(team) {
  return {
    numTeamPlayers: 0,

    TP1: 0,
    WIP1: 0,
    timesheet: 0,

    TP2: 0,
    WIP2: 0,
    LeadTime: 0,

    resourceEfficiency: 0,

    leadTime1: 0,
    avgTouchTime1: 0,
    flowEff1: 0,

    leadTime2: 0,
    avgTouchTime2: 0,
    flowEff2: 0,

    gatherInput: function(team) {
      this.numTeamPlayers = parseInt(team.numTeamPlayersElm.value);
      this.TP1 = parseInt(team.r1Elm.TP.value);
      this.WIP1 = parseInt(team.r1Elm.WIP.value);
      this.timesheet = parseInt(team.r1Elm.Timesheet.value);

      this.TP2 = parseInt(team.r2Elm.TP.value);
      this.WIP2 = parseInt(team.r2Elm.WIP.value);
      this.LeadTime = parseInt(team.r2Elm.LeadTime.value);
    },
    calcMetrics: function(team) {
      this.resourceEfficiency = (this.timesheet * 1.0 / (this.numTeamPlayers * 10.0) * 100.0).toFixed(2);

      this.leadTime1 = (this.WIP1 / (this.TP1 / 10.0)).toFixed(2);
      this.avgTouchTime1 = ((this.numTeamPlayers * 10.0) / (this.TP1 + this.WIP1)).toFixed(2);
      this.flowEff1 = ((this.avgTouchTime1 / this.leadTime1) * 100.00).toFixed(2)

      this.leadTime2 = (this.LeadTime / this.TP2).toFixed(2);
      this.avgTouchTime2 = ((this.numTeamPlayers * 10.0) / (this.TP2 + this.WIP2)).toFixed(2);
      this.flowEff2 = ((this.avgTouchTime2 / this.leadTime2) * 100.00).toFixed(2)

      this.updateMetrics(team);
    },

    setFieldValue: function(field, value) {
      if (isNaN(value)) {
        field.innerHTML = "missing data"
        return
      }

      field.innerHTML = value;
    },

    updateMetrics: function(team) {
      this.setFieldValue(team.results.resourceEff, this.resourceEfficiency);

      this.setFieldValue(team.results.round1.leadTime, this.leadTime1);
      this.setFieldValue(team.results.round1.avgTouchTime, this.avgTouchTime1);
      this.setFieldValue(team.results.round1.flowEff, this.flowEff1);

      this.setFieldValue(team.results.round2.leadTime, this.leadTime2);
      this.setFieldValue(team.results.round2.avgTouchTime, this.avgTouchTime2);
      this.setFieldValue(team.results.round2.flowEff, this.flowEff2);
    },
  };
}

function bindTeamElm(teamName, metrics) {
  let team = $id(teamName);
  let resultsElm = team.querySelector(".team-results");

  let teamElm = {
    calcButton: team.querySelector(".button"),
    teamNameElm: team.querySelector(".team-name"),
    numTeamPlayersElm: team.querySelector(".team-players"),

    r1Elm: {
      TP: team.querySelector(".round1-team-tp"),
      WIP: team.querySelector(".round1-team-wip"),
      Timesheet: team.querySelector(".team-timesheet")
    },

    r2Elm: {
      TP: team.querySelector(".round2-team-tp"),
      WIP: team.querySelector(".round2-team-wip"),
      LeadTime: team.querySelector(".team-lead-time")
    },

    results: {
      resourceEff: resultsElm.querySelector(".resource-efficiency"),
      round1: {
        leadTime: resultsElm.querySelector(".round1-lead-time"),
        avgTouchTime: resultsElm.querySelector(".round1-avg-touch-time"),
        flowEff: resultsElm.querySelector(".round1-flow-eff")
      },
      round2: {
        leadTime: resultsElm.querySelector(".round2-lead-time"),
        avgTouchTime: resultsElm.querySelector(".round2-avg-touch-time"),
        flowEff: resultsElm.querySelector(".round2-flow-eff")
      }
    },
    wireCalulator: function(metrics) {
      this.calcButton.onclick = (e) => {
        metrics.gatherInput(this);
        metrics.calcMetrics(this);
      }
    }
  };

  teamElm.wireCalulator(metrics);
  return teamElm;
}

function copyTemplate(srcName, targetName, newTargetId) {
  let srcElm = $id(srcName)
  let targetElm = $id(targetName)

  targetElm.innerHTML = srcElm.innerHTML;

  let teamElm = targetElm.child("#team-1");
  teamElm.$id(newTargetId)
}

copyTemplate("team-template", "template-1", "team-2")
copyTemplate("team-template", "template-2", "team-3")
copyTemplate("team-template", "template-3", "team-4")

bindTeamElm("team-1", newMetrics());
bindTeamElm("team-2", newMetrics());
bindTeamElm("team-3", newMetrics());
bindTeamElm("team-4", newMetrics());
