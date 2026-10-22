import React from 'react';
import { View } from 'react-native';
import { Button, Card, T } from '../common/UI';
import { C } from '../../constants/theme';
import type { OwnVolunteerTeam } from '../../api/volunteers';

export function LiveTeamMembership({ teams, loading, error, onRefresh }: {
  teams: OwnVolunteerTeam[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}) {
  return <>
    <T size={20} weight="700" color={C.ink} style={{ marginTop: 18, marginBottom: 11 }}>My Team</T>
    <Card style={{ marginBottom: 18 }}>
      {loading ? <T>Loading teams...</T> : error ? <T color={C.red}>{error}</T> : teams.length ? teams.map(team =>
        <View key={team.id} style={{ paddingVertical: 9 }}>
          <T size={17} weight="700" color={C.ink} translate={false}>{team.name}</T>
          {team.isLeader && <T size={13} weight="700" color={C.green}>Team leader</T>}
        </View>
      ) : <T color={C.muted}>You are not currently assigned to a team.</T>}
      <Button title={error ? 'Retry' : 'Refresh teams'} variant="outline" onPress={onRefresh} loading={loading} style={{ marginTop: 12 }} />
    </Card>
  </>;
}
