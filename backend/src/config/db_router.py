"""
Database Router for Read Replicas
Routes read queries to replica databases for improved performance
"""
class ReplicaRouter:
    """
    A router to control database operations on models.
    Routes all read operations to replica database.
    Routes all write operations to primary database.
    """
    
    def db_for_read(self, model, **hints):
        """
        Attempts to read from replica database
        """
        return 'replica'
    
    def db_for_write(self, model, **hints):
        """
        Attempts to write to primary database
        """
        return 'default'
    
    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations if both objects are in the same database pool
        """
        db_set = {'default', 'replica'}
        if obj1._state.db in db_set and obj2._state.db in db_set:
            return True
        return None
    
    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Make sure migrations only happen on primary database
        """
        return db == 'default'
