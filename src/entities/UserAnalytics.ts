import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class UserAnalytics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({unique: true})
  source: string;

  // @Column({type: 'real'})
  @Column()
  new_users: string;

  // @Column({type: 'real'})
  @Column()
  sessions: string;

  @Column()
  first_seen_on: Date;

  // @Column({type: 'real'})
  @Column()
  pages_session: string;

  // @Column({type: 'real'})
  @Column()
  avg_session_duration: string;

  // @Column({type: 'real'})
  @Column()
  conversation_rate: string;

  // @Column({type: 'real'})
  @Column()
  goal_value: string;
}