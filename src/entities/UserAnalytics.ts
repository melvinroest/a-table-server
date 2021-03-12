import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class UserAnalytics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({unique: true})
  source: string;

  @Column({type: 'real'})
  // @Column()
  users: number;

  @Column({type: 'real'})
  // @Column()
  new_users: number;

  @Column({type: 'real'})
  // @Column()
  sessions: number;

  @Column({type: 'real'})
  // @Column()
  bounce_rate: number;

  @Column()
  first_seen_on: Date;

  @Column({type: 'real'})
  // @Column()
  pages_session: number;

  @Column({type: 'real'})
  // @Column()
  avg_session_duration: number;

  @Column({type: 'real'})
  // @Column()
  conversion_rate: number;

  @Column({type: 'real'})
  // @Column()
  goal_value: number;
}